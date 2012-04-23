-module(commit_hooks).
-export([validate_json/1, audit_trail/1]).

validate_json(Object) ->
  try
    mochijson2:decode(riak_object:get_value(Object)),
    Object
  catch
    throw:invalid_utf8 ->
      {fail, "Parsing the object failed: Illegal UTF-8 character"};
    error:Error ->
      {fail, "Parsing the object failed: " ++
        binary_to_list(list_to_binary(io_lib:format("~p", [Error])))}
  end.

audit_trail(Object) ->
  Key = riak_object:key(Object),
  Bucket = <<"audit_trail">>,
  Metadata = riak_object:get_metadata(Object),
  Deleted = dict:is_key(<<"X-Riak-Deleted">>, Metadata),
  {ok, Client} = riak:local_client(),

  AuditTrail = case Client:get(Bucket, Key) of
    {error, notfound} -> [];
    {ok, AuditObject} -> 
      {struct, [{<<"trail">>, Data}]} =
        mochijson2:decode(riak_object:get_value(AuditObject)),
      Data 
  end,

  Entry = case Deleted of
    true -> [{struct, [{get_timestamp(),
               mochijson2:decode(
                  riak_object:get_value(Object))}]}];
    false -> [{struct, [{get_timestamp(), null}]}]
  end,
  UpdatedAudit = lists:append(AuditTrail, Entry),
  Json = list_to_binary(mochijson2:encode({struct, [{<<"trail">>, UpdatedAudit}]})),
  AuditObject2 = riak_object:new(Bucket, Key, Json, "application/json"),
  Client:put(AuditObject2),
  Object.

get_timestamp() ->
  {Mega,Sec,Micro} = erlang:now(),
  list_to_binary(integer_to_list((Mega*1000000+Sec)*1000000+Micro)).
