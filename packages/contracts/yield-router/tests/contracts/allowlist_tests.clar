(define-read-only (should-reject-unknown-protocol)
  (let ((result (contract-call? .router route-deposit 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.mock-token u1000 u99 u0 .mock-adapter)))
    (if (is-err result) (get err result) (err u999))))
