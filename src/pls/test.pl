program(P) :-
  P = (Head :- Body),
  Head = head(A, B),
  Body = body(A, B).
