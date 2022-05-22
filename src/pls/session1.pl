sessions(1).
sessions(2).
sessions(3).
sessions(4).


session_progress(1, 1) :- interaction(drag_box).
session_progress(1, 2) :- interaction(dup_box).
session_progress(1, 3) :- interaction(dispose_box).


session_progress(2, 0).
session_progress(2, 1) :- interaction(word_inside_paranthesis).

session(1, 0).
session(X, 0) :- sessions(X), Y is X - 1, findall(_, session_progress(Y, _), Ls), length(Ls, 3).
session(X, Y) :- session_progress(X, Y).


counter(_) :- fail.

file(a).
file(b).
file(c).

