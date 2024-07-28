# `wait-for-checks` Action

A GitHub Action that waits for the specified checks to complete. Supports both
checks and statuses.
[(yes this is confusing)](https://stackoverflow.com/questions/67919168/github-checks-api-vs-check-runs-vs-check-suites)

This action treats non-existent checks as pending, assuming that they will
eventually be created.
