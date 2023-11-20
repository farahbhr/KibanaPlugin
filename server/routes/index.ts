import { IRouter } from '../../../../src/core/server';
import { schema } from '@kbn/config-schema';

export function defineRoutes({ router, logger, clusterClient }) {
    router.get(
    {
      path: '/api/monitor_call_id/search_callID',
      validate: false,
    },
    async (context, request, response) => {
      const client = context.core.elasticsearch.client.asCurrentUser;
      console.log("request: ",request);

      const searchParams = Object.fromEntries(request.url.searchParams); // Convert URLSearchParams object to plain object
      const searchCallID = searchParams.searchCallID; // Retrieve searchCallID from searchParams
      console.log("searchCallID: ",searchCallID);
      
      //Extract ID startTime dynamically
      const { body: extractStartTime } = await client.search({
        index: 'filebeat-*',
        size:10000,
        body: {
		query:{
   			 bool: {
			      should: [
			        {
			          match_phrase: {
				  LogMessage: "Begin ID = "+searchCallID
			          }
			        },
			        {
			          match_phrase: {
			            LogMessage: "creating new Id "+searchCallID
			          }
			        }
			      ]
			    }
		  }
	}
	});
	console.log("extractStartTime: ", extractStartTime);
	const startTime = extractStartTime.hits.hits[0]._source.StartTime;
	console.log("startTime: ", startTime);

	const server = extractStartTime.hits.hits[0]._source.Server;
        console.log("Server: ", server);


	//Extract ID endTime dynamically
        const { body: extractEndTime } = await client.search({
        index: 'filebeat-*',
        size:10000,
        body: {
                query:{
                         bool: {
                              should: [
                                {
                                  match_phrase: {
                                    LogMessage: "end Id"+searchCallID
                                  }
                                },
                                {
                                  match_phrase: {
                                    LogMessage: "Destroying ID = "+searchCallID
                                  }
                                }
                              ]
                            }
                  }
        }
        });
	console.log("extractEndTime: ", extractEndTime);
	const lastHitIndex = extractStartTime.hits.hits.length - 1;
        const endTime = extractEndTime.hits.hits[lastHitIndex]._source.EndTime;
        console.log("endTime: ", endTime);

	//Elasticsearch request to extract all the logs lines related to a callID
        const { body: result } = await client.search({
        index: 'filebeat-*',
        size:10000, 
	body: {
  sort: [{
    "@timestamp": {
        order: "asc"
    }
  }
  ],    
  query: {
    bool: {
      must: [
        {
          range: {
            "@timestamp": {
              gte: startTime,
              lte: endTime
            }
          }
	      },
	      {
           match: {
             Server: server
 	          }
        }, 
        {
	        bool: {
	  
            must_not: [
              {
                match_phrase: {
                  LogMessage: "Request ID"
                }
              },
              {
                match_phrase: {
                  LogMessage: "Is Return Transfer"
                }
              }
            ],
            should: [
	            {
                term: {
                  "ID.keyword": searchCallID
                }
              }
            ]
          }
        }
      ]
    }
  }
}
});
           const reply = result.hits.hits;
           return response.ok({
                body: {
                    reply,
                },
 	});
    }
  );
}

