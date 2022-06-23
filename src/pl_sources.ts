const reif = `

sameargs(N0, S, T) :-
   N0 > 0,
   N1 is N0-1,
   arg(N0, S, A),
   arg(N0, T, A),
   sameargs(N1, S, T).
sameargs(0, _, _).

ugoal_expansion(if_(If_1, Then_0, Else_0), Goal) :-
   nonvar(If_1), If_1 = (X = Y),
   goal_expanded(call(Then_0), Thenx_0),
   goal_expanded(call(Else_0), Elsex_0),
   !,
   Goal =
      ( X \= Y -> Elsex_0
      ; X == Y -> Thenx_0
      ; X = Y,    Thenx_0
      ; dif(X,Y), Elsex_0
      ).
ugoal_expansion(if_(If_1, Then_0, Else_0), Goal) :-
   subsumes_term((A_1;B_1), If_1),
   (A_1;B_1) = If_1,
   !,
   Goal = if_(A_1, Then_0, if_(B_1, Then_0, Else_0)).
ugoal_expansion(if_(If_1, Then_0, Else_0), Goal) :-
   subsumes_term((A_1,B_1), If_1),
   (A_1,B_1) = If_1,
   !,
   Goal = if_(A_1, if_(B_1, Then_0, Else_0), Else_0).
ugoal_expansion(if_(If_1, Then_0, Else_0), Goal) :-
   goal_expanded(call(If_1, T), Ifx_0),
   goal_expanded(call(Then_0), Thenx_0),
   goal_expanded(call(Else_0), Elsex_0),
   Goal =
      (  Ifx_0,
         (  T == true -> Thenx_0
         ;  T == false -> Elsex_0
         ;  nonvar(T) -> throw(error(type_error(boolean,T),
                               type_error(call(If_1,T),2,boolean,T)))
         ;  throw(error(instantiation_error,
                               instantiation_error(call(If_1,T),2)))
         )
      ).

if_(If_1, Then_0, Else_0) :-
   call(If_1, T),
   (  T == true -> Then_0
   ;  T == false -> Else_0
   ;  nonvar(T) -> throw(error(type_error(boolean,T),
                               type_error(call(If_1,T),2,boolean,T)))
   ;  throw(error(instantiation_error,instantiation_error(call(If_1,T),2)))
   ).


tfilter(C_2, Es, Fs) :-
   i_tfilter(Es, C_2, Fs).

i_tfilter([], _, []).
i_tfilter([E|Es], C_2, Fs0) :-
   if_(call(C_2, E), Fs0 = [E|Fs], Fs0 = Fs),
   i_tfilter(Es, C_2, Fs).

tpartition(P_2, Xs, Ts, Fs) :-
   i_tpartition(Xs, P_2, Ts, Fs).

i_tpartition([], _P_2, [], []).
i_tpartition([X|Xs], P_2, Ts0, Fs0) :-
   if_( call(P_2, X)
      , ( Ts0 = [X|Ts], Fs0 = Fs )
      , ( Fs0 = [X|Fs], Ts0 = Ts ) ),
   i_tpartition(Xs, P_2, Ts, Fs).

=(X, Y, T) :-
   (  X == Y -> T = true
   ;  X \= Y -> T = false
   ;  T = true, X = Y
   ;  T = false,
      dif(X, Y)
   ).

dif(X, Y, T) :-
  =(X, Y, NT),
  non(NT, T).

non(true, false).
non(false, true).

','(A_1, B_1, T) :-
   if_(A_1, call(B_1, T), T = false).

;(A_1, B_1, T) :-
   if_(A_1, T = true, call(B_1, T)).

cond_t(If_1, Then_0, T) :-
   if_(If_1, ( Then_0, T = true ), T = false ).

memberd_t(E, Xs, T) :-
   i_memberd_t(Xs, E, T).

i_memberd_t([], _, false).
i_memberd_t([X|Xs], E, T) :-
   if_( X = E, T = true, i_memberd_t(Xs, E, T) ).

tmember(P_2, [X|Xs]) :-
   if_( call(P_2, X), true, tmember(P_2, Xs) ).

tmember_t(P_2, [X|Xs], T) :-
   if_( call(P_2, X), T = true, tmember_t(P_2, Xs, T) ).
`


const base0_colors_source = `
:- dynamic(white/1).
:- dynamic(orange/1).
:- dynamic(black/1).
color(white, Pos) :- white(Pos).
color(orange, Pos) :- orange(Pos).
color(black, Pos) :- black(Pos).
`

const base0_source = `
% Prolog
:- use_module(library(reif)).


% Earlier sections are at the bottom of this file.


% Section 6

color(w).
color(b).

role(k).
role(q).
role(b).
role(n).
role(r).
role(p).

pos(X-Y) :- file(X), rank(Y).

piece(Color-Role) :- color(Color), role(Role). 
piese(Piece-Pos) :- piece(Piece), pos(Pos).

% https://stackoverflow.com/questions/27358456/prolog-union-for-a-u-b-u-c/27358600#27358600
on(B, P) :- memberd_t(P, B, true).

bigger(X-Y, X_-Y_) :- upper(Y-Y_, _); Y=Y_, righter(X-X_, _).
bigger_piese(_-_-P, _-_-P2) :- bigger(P, P2).


on_pos(true, B, Pos) :- on(B, _-_-Pos).
on_pos(false, B, Pos) :- in(w-r-Pos, B, _).


% https://stackoverflow.com/questions/53531536/insert-into-open-ended-list-without-binding-its-tail-variable
in(P, B, [P]) :- 
  nonvar(B),
  B = [].
in(P, Bs, [P | Bs]) :-
  var(Bs).
in(P, B, [N | Zs]) :-
  nonvar(B),
  B = [N | Ys],
  bigger_piese(N, P),
  in(P, Ys, Zs).

in(P, B, [P, N | Ys]) :-
  nonvar(B),
  B = [N | Ys],
  bigger_piese(P, N).


out(P, [P|Xs], Xs).
out(P, [X|Xs], [X|Ys]) :- dif(P, X), out(P, Xs, Ys).



% Section 1-5

file(a).
file(b).
file(c).
file(d).
file(e).
file(f).
file(g).
file(h).



rank(1).
rank(2).
rank(3).
rank(4).
rank(5).
rank(6).
rank(7).
rank(8).




ray_route(b-P, P2, Is) :- bishop(P, P2, Is).
ray_route(q-P, P2, Is) :- queen(P, P2, Is).
ray_route(r-P, P2, Is) :- rook(P, P2, Is).
ray_route(n-P, P2, []) :- knight(P, P2).
ray_route(k-P, P2, []) :- king(P, P2).

pawn_push(w-P, P2, Is) :- white_push(P, P2, Is).
pawn_push(b-P, P2, Is) :- black_push(P, P2, Is).

pawn_capture(w-P, P2) :- white_capture(P, P2).
pawn_capture(b-P, P2) :- black_capture(P, P2).



right(a-b).
right(b-c).
right(c-d).
right(d-e).
right(e-f).
right(f-g).
right(g-h).

left(X-Y) :- right(Y-X).
leftright(X-Y) :- left(X-Y); right(X-Y).


right2(X-Y) :- right(X-Z), right(Z-Y).
left2(X-Y) :- right2(Y-X).

righter(X-Y, []) :- right(X-Y).
righter(X-Y, [Z|Rest]) :- right(X-Z), righter(Z-Y, Rest).

lefter(X-Y, []) :- left(X-Y).
lefter(X-Y, [Z|Rest]) :- left(X-Z), lefter(Z-Y, Rest).


righter(X-Y) :- righter(X-Y, []).
lefter(X-Y) :- lefter(Y-X, []).



up(1-2).
up(2-3).
up(3-4).
up(4-5).
up(5-6).
up(6-7).
up(7-8).

down(X-Y) :- up(Y-X).
updown(X-Y) :- up(X-Y);down(X-Y).

up2(X-Y) :- up(X-Z), up(Z-Y).
down2(X-Y) :- up2(Y-X).

upper(X-Y, []) :- up(X-Y).
upper(X-Y, [Z|Rest]) :- up(X-Z), upper(Z-Y, Rest).

downer(X-Y, []) :- down(X-Y).
downer(X-Y, [Z|Rest]) :- down(X-Z), downer(Z-Y, Rest).

upper(X-Y) :- upper(X-Y, []).
downer(X-Y) :- upper(Y-X, []).




zip_pos([], [], []).
zip_pos([X|Xs], [Y|Ys], [X-Y|Rest]) :- zip_pos(Xs, Ys, Rest).

% https://stackoverflow.com/questions/67946585/using-maplist-with-a-lambda-that-does-not-have-a-body
forward(X-Y,X-Y_, N) :- upper(Y-Y_, M), findall(X-Y__, memberd_t(Y__, M, true), N).
backward(X-Y,X-Y_, N) :- downer(Y-Y_, M), findall(X-Y__, memberd_t(Y__, M, true), N).
queen_side(X-Y,X_-Y, N) :- lefter(X-X_, M), findall(X__-Y, memberd_t(X__, M, true), N).
king_side(X-Y,X_-Y, N) :- righter(X-X_, M), findall(X__-Y, memberd_t(X__, M, true), N).

fwd_que(X-Y, X_-Y_, N) :- upper(Y-Y_, MY), lefter(X-X_, MX), zip_pos(MX, MY, N).
fwd_kng(X-Y, X_-Y_, N) :- upper(Y-Y_, MY), righter(X-X_, MX), zip_pos(MX, MY, N).
bck_que(X-Y, X_-Y_, N) :- downer(Y-Y_, MY), lefter(X-X_, MX), zip_pos(MX, MY, N).
bck_kng(X-Y, X_-Y_, N) :- downer(Y-Y_, MY), righter(X-X_, MX), zip_pos(MX, MY, N).

fwd_que2bck_kng(X,Y, N) :- fwd_que(X, Y, N); bck_kng(X, Y, N).
fwd_kng2bck_que(X,Y, N) :- fwd_kng(X, Y, N); bck_que(X, Y, N).

fwd2bck(X,Y, N) :- forward(X, Y, N); backward(X, Y, N).
que2kng(X,Y, N) :- queen_side(X, Y, N); king_side(X, Y, N).

king_fwd(X,Y) :- forward(X,Y, []); fwd_que(X,Y, []); fwd_kng(X,Y, []). 
king_bck(X,Y) :- backward(X,Y, []); bck_que(X,Y, []); bck_kng(X,Y, []).
king_lat(X,Y) :- queen_side(X,Y, []); king_side(X,Y,[]).

fwd2_que(X-Y, X_-Y_) :- up2(Y-Y_), left(X-X_).
fwd2_kng(X-Y, X_-Y_) :- up2(Y-Y_), right(X-X_).

fwd_que2(X-Y, X_-Y_) :- up(Y-Y_), left2(X-X_).
fwd_kng2(X-Y, X_-Y_) :- up(Y-Y_), right2(X-X_).


bck2_que(X-Y, X_-Y_) :- down2(Y-Y_), left(X-X_).
bck2_kng(X-Y, X_-Y_) :- down2(Y-Y_), right(X-X_).

bck_que2(X-Y, X_-Y_) :- down(Y-Y_), left2(X-X_).
bck_kng2(X-Y, X_-Y_) :- down(Y-Y_), right2(X-X_).

fwd2(X, Y, N) :- forward(X, Y, N), length(N, 1).
bck2(X, Y, N) :- backward(X, Y, N), length(N, 1).


knight(X, Y) :- fwd2_que(X, Y); fwd2_kng(X, Y); fwd_que2(X, Y); fwd_kng2(X, Y); 
                bck2_que(X, Y); bck2_kng(X, Y); bck_que2(X, Y); bck_kng2(X, Y).

bishop(X, Y, N) :- fwd_que(X, Y, N); fwd_kng(X, Y, N); bck_que(X, Y, N); bck_kng(X, Y, N).
rook(X, Y, N) :- forward(X, Y, N); backward(X, Y, N); queen_side(X, Y, N); king_side(X, Y, N).
king(X, Y) :- king_fwd(X, Y); king_bck(X, Y); king_lat(X, Y).
queen(X, Y, N) :- bishop(X, Y, N); rook(X, Y, N).

white_push(X, Y, N) :- dif(WB, X), white_base(WB), white_home(X), fwd2(X, Y, N). 
white_push(X, Y, []) :- dif(WB, X), white_base(WB), forward(X, Y, []).
white_capture(X, Y) :- dif(WB, X), white_base(WB), (fwd_kng(X, Y, []); fwd_que(X, Y, [])).
white_en_passant(X, Y, C) :- black_home2(X), white_capture(X, Y), backward(Y, C, []).
white_promote(X) :- black_home(X).

black_push(X, Y, N) :- dif(BB, X), black_base(BB), black_home(X), bck2(X, Y, N).
black_push(X, Y, []) :- dif(BB, X), black_base(BB), backward(X, Y, []).
black_capture(X, Y) :- dif(BB, X), black_base(BB), (bck_kng(X, Y, []); bck_que(X, Y, [])).
black_en_passant(X, Y, C) :- white_home2(X), black_capture(X, Y), forward(Y, C, []).
black_promote(X) :- white_home(X).




% Utility

fen_board(F, T-B) :- fen_board_unsorted(F, T-UB), foldl(in, UB, [], B).

`


export const base_sources = [reif, base0_source, base0_colors_source].join('\n')

export const base_source = ``


