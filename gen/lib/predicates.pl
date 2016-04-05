% Whether X is divisible by Y.
divisible(X,Y) :-
  0 is mod(X,Y).

% Whether X is factor of Y.
factor(X,Y) :-
  X>1,
  0 is mod(Y,X).
