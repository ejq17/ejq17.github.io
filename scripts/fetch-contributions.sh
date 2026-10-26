#!/usr/bin/env sh
# Writes assets/data/contributions.json from GitHub's GraphQL API.
# Needs a token in GH_TOKEN (or the gh CLI logged in). Used by the nightly Action; also runnable by hand.
set -eu
LOGIN="${1:-ejq17}"
OUT="${2:-assets/data/contributions.json}"
QUERY='query($login:String!){ user(login:$login){ contributionsCollection{ contributionCalendar{ totalContributions weeks{ contributionDays{ date contributionCount contributionLevel } } } } } }'
gh api graphql -f query="$QUERY" -f login="$LOGIN" --jq '
  .data.user.contributionsCollection.contributionCalendar
  | { updated: (now | strftime("%Y-%m-%dT%H:%M:%SZ")),
      total: .totalContributions,
      weeks: [ .weeks[] | [ .contributionDays[] | [ .date, .contributionCount,
        ({NONE:0, FIRST_QUARTILE:1, SECOND_QUARTILE:2, THIRD_QUARTILE:3, FOURTH_QUARTILE:4}[.contributionLevel]) ] ] ] }' > "$OUT"
echo "wrote $OUT"
