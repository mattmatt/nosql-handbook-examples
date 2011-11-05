-module(german_analyzer).
-export([
         german_analyzer_factory/2
        ]).

-define(UPPERCHAR(C),  (C >= $A andalso C =< $Z)).
-define(LOWERCHAR(C),  (C >= $a andalso C =< $z)).
-define(NUMBER(C),     (C >= $0 andalso C =< $9)).
-define(WHITESPACE(C), ((C == $\s) orelse (C == $\n) orelse (C == $\t) orelse (C == $\f) orelse (C == $\r) orelse (C == $\v))).

%% @doc Tokenize incoming text using roughly the same rules as the
%% StandardAnalyzerFactory in Lucene/Java.
german_analyzer_factory(Text, [MinLengthArg]) ->
    MinLength = list_to_integer(MinLengthArg),
    {ok, german(Text, MinLength, [], [])};
german_analyzer_factory(Text, _Other) ->
    {ok, german(Text, 3, [], [])}.

german(<<H, T/binary>>, MinLength, Acc, ResultAcc) when ?UPPERCHAR(H) ->
    H1 = H + ($a - $A),
    german(T, MinLength, [H1|Acc], ResultAcc);
german(<<H, T/binary>>, MinLength, Acc, ResultAcc) when ?LOWERCHAR(H) orelse ?NUMBER(H) ->
    german(T, MinLength, [H|Acc], ResultAcc);
german(<<$.,H,T/binary>>, MinLength, Acc, ResultAcc) when ?UPPERCHAR(H) ->
    H1 = H + ($a - $A),
    german(T, MinLength, [H1,$.|Acc], ResultAcc);
german(<<$.,H,T/binary>>, MinLength, Acc, ResultAcc) when ?LOWERCHAR(H) orelse ?NUMBER(H) ->
    german(T, MinLength, [H,$.|Acc], ResultAcc);
german(<<_,T/binary>>, MinLength, Acc, ResultAcc) ->
    german_termify(T, MinLength, Acc, ResultAcc);
german(<<>>, MinLength, Acc, ResultAcc) ->
    german_termify(<<>>, MinLength, Acc, ResultAcc).

%% Determine if this term is valid, if so, add it to the list we are
%% generating.
german_termify(<<>>, _MinLength, [], ResultAcc) ->
    lists:reverse(ResultAcc);
german_termify(T, MinLength, [], ResultAcc) ->
    german(T, MinLength, [], ResultAcc);
german_termify(T, MinLength, Acc, ResultAcc) when length(Acc) < MinLength ->
    %% mimic org.apache.lucene.analysis.LengthFilter,
    %% which does not incement position index
    german(T, MinLength, [], ResultAcc);
german_termify(T, MinLength, Acc, ResultAcc) ->
    Term = lists:reverse(Acc),
    case is_stopword(Term) of
        false ->
            TermBinary = list_to_binary(Term),
            NewResultAcc = [TermBinary|ResultAcc];
        true -> 
            NewResultAcc = [skip|ResultAcc]
    end,
    german(T, MinLength, [], NewResultAcc).


is_stopword(Term) when length(Term) == 2 -> 
    ordsets:is_element(Term, ["an", "ab", "da", "er", "es", "im", "in", "ja", "wo", "zu"]);
is_stopword(Term) when length(Term) == 3 -> 
    ordsets:is_element(Term, ["das", "dem", "den", "der", "die", "für", "sie", "uns", "was", "wie"]);
is_stopword(Term) when length(Term) == 4 -> 
    ordsets:is_element(Term, ["aber", "auch", "dein", "euer", "eure", "mein", "wann"]);
is_stopword(Term) when length(Term) == 5 -> 
    ordsets:is_element(Term, ["sowie", "warum", "wieso", "woher", "wohin"]);
is_stopword(Term) when length(Term) == 6 -> 
    ordsets:is_element(Term, ["machen", "sollen", "soweit", "werden"]);
is_stopword(Term) when length(Term) == 7 -> 
    ordsets:is_element(Term, ["dadurch", "deshalb", "nachdem", "weitere", "weshalb"]);
is_stopword(_Term) -> 
    false.
