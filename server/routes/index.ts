import { IRouter } from '../../../../src/core/server';
import { schema } from '@kbn/config-schema';

export function defineRoutes({ router, logger, clusterClient }) {
    router.get(
    {
      path: '/api/search_id/search_ID',
      validate: false,
    },
    async (context, request, response) => {
      const client = context.core.elasticsearch.client.asCurrentUser;
      console.log("request: ",request);

      const searchParams = Object.fromEntries(request.url.searchParams); // Convert URLSearchParams object to plain object
      const searchID = searchParams.searchID; // Retrieve searchID from searchParams
      console.log("searchCallID: ",searchID);
      
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
				  LogMessage: "Begin ID = "+searchID
			          }
			        },
			        {
			          match_phrase: {
			            LogMessage: "creating new Id "+searchID
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
                                    LogMessage: "end Id"+searchID
                                  }
                                },
                                {
                                  match_phrase: {
                                    LogMessage: "Destroying ID = "+searchID
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

	//Elasticsearch request to extract all the logs lines related to an ID
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
                  "ID.keyword": searchID
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

