# Lighthouse from CI, phase 001

Read from the `lhr-*.json` files in each run's Lighthouse artifact (`gh run download <run>`), one
file per page per run, 3 runs per page. Median of the 3 performance scores; lowest accessibility
score.

| Page | Base: run 45505132969 at 81d4536 (`dev`) | Final: run 46137084489 at a461fb3 |
|---|---|---|
| `/` | performance 97/97/97 (median 97), accessibility 100 | performance 97/97/97 (median 97), accessibility 100 |
| `/work/etp/` | 98/98/98 (98), 100 | 98/98/98 (98), 100 |
| `/how-i-build/` | 98/98/98 (98), 100 | 98/98/98 (98), 100 |
| `/resume/` | 98/98/98 (98), 100 | 98/98/98 (98), 100 |

a461fb3 holds the same code as c429ee3, the final code commit: the commits between them change only
`specs/` (`git diff --stat c429ee3 a461fb3`).
