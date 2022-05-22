% Prolog 
:- use_module(library(lists)).


:- dynamic(time/1).

time(0).

tick :- time(N), N1 is N + 1, retract(time(N)), assertz(time(N1)).


:- dynamic(interaction/1).


:- dynamic(file/1).

add_file(X) :- assertz(file(X)).
remove_file(_) :- findall(_, file(X), Ls), length(Ls, 1).
remove_file(X) :- retract(file(X)).
change_file(X, P) :- remove_file(P), add_file(X).


add_interaction(X) :- \+ interaction(X), assertz(interaction(X)).
