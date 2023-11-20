import React, 
{ useState, 
  Fragment, 
  useEffect,
  createContext,
  useContext,
  useCallback,
  useRef,
  createRef, 
} from 'react';

import { i18n } from '@kbn/i18n';
import { FormattedMessage, I18nProvider } from '@kbn/i18n/react';
import { BrowserRouter as Router } from 'react-router-dom';

import {
  EuiFieldSearch,
  EuiRange,
  EuiTextArea,
  EuiFormRow,
  EuiFlexGroup,
  EuiFlexItem,
  EuiSpacer,

  EuiButtonEmpty,
  EuiButtonIcon,
  EuiCode,
  EuiContextMenuItem,
  EuiContextMenuPanel,
  EuiDataGrid,
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutFooter,
  EuiFlyoutHeader,
  EuiLink,
  EuiModal,
  EuiModalBody,
  EuiModalFooter,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiPopover,
  EuiScreenReaderOnly,
  EuiDataGridPaginationProps,

  EuiButton,
  EuiHorizontalRule,
  EuiPage,
  EuiPageBody,
  EuiPageContent,
  EuiPageContentBody,
  EuiPageContentHeader,
  EuiPageHeader,
  EuiTitle,
  EuiText,
} from '@elastic/eui';

import {
  DataPublicPluginStart,
  DataPublicPluginSetup,
  IKibanaSearchResponse,
  IndexPattern,
  isCompleteResponse,
  isErrorResponse,
  IndexPatternField,
//  esQuery, 
  QueryState,
  Query,
} from '../../../../src/plugins/data/public';

import { CoreStart } from '../../../../src/core/public';
import { NavigationPublicPluginStart } from '../../../../src/plugins/navigation/public';

import { getEsQueryConfig, buildEsQuery } from '../../../../src/plugins/data/common';

import { PLUGIN_ID, PLUGIN_NAME, INDEX_NAME } from '../../common';

interface SearchForIdAppDeps {
  basename: string;
  notifications: CoreStart['notifications'];
  uiSettings: CoreStart['uiSettings'];
  http: CoreStart['http'];
  navigation: NavigationPublicPluginStart;
  data: DataPublicPluginStart;
}

function getNumeric(fields?: IndexPatternField[]) {
  if (!fields) return [];
  return fields?.filter((f) => f.type === 'number' && f.aggregatable);
}

function getAggregatableStrings(fields?: IndexPatternField[]) {
  if (!fields) return [];
  return fields?.filter((f) => f.type === 'string' && f.aggregatable);
}

function formatFieldToComboBox(field?: IndexPatternField | null) {
  if (!field) return [];
  return formatFieldsToComboBox([field]);
}

function formatFieldsToComboBox(fields?: IndexPatternField[]) {
  if (!fields) return [];

  return fields?.map((field) => {
    return {
      label: field.displayName || field.name,
    };
  });
}

export const SearchForIdApp = ({
  basename,
  notifications,
  uiSettings,
  http,
  navigation,
  data,
}: SearchForIdAppDeps) => {

  // Use React hooks to manage state.

  const { IndexPatternSelect } = data.ui;
  const [indexPattern, setIndexPattern] = useState('filebeat-*');
  const [fields, setFields] = useState<IndexPatternField[]>();
  
  const [selectedNumericField, setSelectedNumericField] = useState<
    IndexPatternField | null | undefined
  >();
  const [selectedBucketField, setSelectedBucketField] = useState<
    IndexPatternField | null | undefined
  >();

  const [endData, setEndData] = useState<any>();

  const [queryState, setQueryState] = useState<QueryState | null>();
  const [kbnQuery, setKbnQuery] = useState<Query>();

  const [request, setRequest] = useState<Record<string, any>>({});
  const [rawResponse, setRawResponse] = useState<Record<string, any>>({});

  const [result, setResult] = useState<any>();

  const [searchCallID, setSearchCallID] = useState<string | undefined>();
  const [hits, setHits] = useState<string[]>([]);

  const [showTable, setShowTable] = useState(false);

  const columns = [
  {
    id: '@timestamp',
    displayAsText: 'Date & Time',
    defaultSortDirection: 'asc',
    isSortable: true,
    initialWidth: 224,
  },
  {
    id: 'Server',
    displayAsText: 'Server',
    isSortable: false,
    initialWidth: 143,
  },
  {
    id: 'Service',
    displayAsText: 'Service',
    isSortable: false,
    initialWidth: 85,
  },
  {
    id: 'ProcessID',
    displayAsText: 'Process ID',
    isSortable: true,
    initialWidth: 107,
  },
  {
    id: 'LogMessage',
    displayAsText: 'Log Message',
    isSortable: false,
    initialWidth: 555,
  }
  ];


  data.query.state$.subscribe(({ state }) => {
    setQueryState(state);
    console.log("queryState", queryState);
    console.log("setQueryState", setQueryState);
  });

  const onQuerySubmit = useCallback(
    ({ query }) => {
      setKbnQuery(query);
      console.log("query: ", query);
      console.log("setKbnQuery", setKbnQuery);
      doAsyncSearch();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [kbnQuery]
  );


function setResponse(response: IKibanaSearchResponse) {
    setRawResponse(response.rawResponse);
  }

  useEffect(() => {
    setSelectedBucketField(fields?.length ? getAggregatableStrings(fields)[0] : null);
    setSelectedNumericField(fields?.length ? getNumeric(fields)[0] : null);
  }, [fields]);

  // Fetch the default index pattern using the `data.indexPatterns` service, as the component is mounted.
  useEffect(() => {
    const setDefaultIndexPattern = async () => {
      const defaultIndexPattern = await data.indexPatterns.getDefault();
      setIndexPattern(defaultIndexPattern);
      console.log("defaultIndexPattern: ", defaultIndexPattern);
    };
    setDefaultIndexPattern();
  }, [data, uiSettings]);

  // Update the fields list every time the index pattern is modified.
  useEffect(() => {
    setFields(indexPattern?.fields);
  }, [indexPattern]);



  const doAsyncSearch = async (strategy?: string) => {
	console.log("start doAsyncSearch");
	console.log("hits", hits);
	console.log("strategy", strategy);
    if (!indexPattern || !hits) return;
	console.log("begin kql");
	const kqlQuery = kbnQuery?.query || '';
	console.log("kqlQuery:", kqlQuery);

    const endData= hits;
    console.log("endData", endData);

// Construct the Elasticsearch query using the KQL query
  const esQuery = {
    bool: {
      must: [
        {
          query_string: {
            query: kqlQuery,
            default_field: '*',
          },
        },
        {
          // Include a filter to narrow the search to the initial results
          terms: {
            _id: endData.map((result) => result._id),
          },
        },
      ],
    },
  };
   console.log("esQuery", esQuery);
	console.log("start initializing query");
	const query = data.query.getEsQuery(indexPattern, [], esQuery);
	console.log("query in doAsync:", query);

    const req = {
      params: {
        index: indexPattern.title,
	size: 10000,
        body: {
	  sort: [{
	    "@timestamp": {
	        order: "asc"
	    }
	  }
	  ], 
          query:esQuery,
        },
      },
    };
	console.log("req", req);
	console.log("kbnQuery:", kbnQuery);
    // Submit the search request using the `data.search` service.
    setRequest(req.params.body);
	console.log("data.search.search(req,{strategy,})", data.search.search(req,{strategy,}));
    const searchSubscription$ = data.search
      .search(req, {
        strategy,
      })
      .subscribe({
        next: (res) => {
          if (isCompleteResponse(res)) {
            setResponse(res);

	    console.log("res:", res);

	console.log("data", data);
	console.log("setResult", setResult);
	console.log("searchSubscription$", searchSubscription$);
	console.log("hits",hits);
	
	setEndData(res.rawResponse.hits.hits);
//	setHits(res.rawResponse.hits.hits);
	console.log("setHits", setHits);
            const message = (
              <EuiText>
                Searched
              </EuiText>
            );
            notifications.toasts.addSuccess(
              {
                title: 'Data Updated',
                text: 'Data Updated',
              }
            );
            searchSubscription$.unsubscribe();
            if (res.warning) {
              notifications.toasts.addWarning({
                title: 'Warning',
                text: 'warning',
              });
            }}
	 else if (isErrorResponse(res)) {
            // TODO: Make response error status clearer
            notifications.toasts.addDanger('An error has occurred');
            searchSubscription$.unsubscribe();
          }
       },
        error: (e) => {
          notifications.toasts.addDanger({
            title: 'Failed to run search',
            text: e.message,
          });
        },
      });
	console.log("hits", hits);
        console.log("endData", endData);
  };

  // Pagination
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 100 });
  const onChangeItemsPerPage = useCallback<
    EuiDataGridPaginationProps['onChangeItemsPerPage']
  >(
    (pageSize) =>
      setPagination((pagination) => ({
        ...pagination,
        pageSize,
        pageIndex: 0,
      })),
    [setPagination]
  );

  const onChangePage = useCallback<EuiDataGridPaginationProps['onChangePage']>(
    (pageIndex) =>
      setPagination((pagination) => ({ ...pagination, pageIndex })),
    [setPagination]
  );

  // Sorting
  const [sortingColumns, setSortingColumns] = useState([]);
  const onSort = useCallback(
    (sortingColumns) => {
      setSortingColumns(sortingColumns);
    },
    [setSortingColumns]
  );

  // Column visibility
  const [visibleColumns, setVisibleColumns] = useState(
    columns.map(({ id }) => id) // initialize to the full set of columns
  );

  const onColumnResize = useRef((eventData) => {
    console.log(eventData);
  });

  const onSearchHandler = async () => {
    console.log("Start onSearchHandler");
    const searchCallID = document.getElementById('searchField')?.value;

    console.log("onSearchHandler const searchCallID: ", searchCallID);
    // Use the core http service to make a request to the server API.
    try {
      const response = await http.get('/api/search_id/search_ID', {
      query: { searchCallID }
      });

      response.message=searchCallID; 
      console.log("onSearchHandler: response:",response);
     
      const hits= response.reply || [];
      console.log("hits: ", hits);

	const endData=hits;
      if (!hits) {
        setHits(['No List']);
	setEndData('No List');
      }
      setHits(hits);
	setEndData(hits);
      console.log("setHits:", setHits);
      setShowTable(true);
    } catch (error) {
      console.error(error);
      console.log("response", response);
    };
    notifications.toasts.addSuccess(
      i18n.translate('searchForId.dataUpdated', {
        defaultMessage: 'ID Searched',
      })
    );
    console.log("onSearchHandler: success");
  };

  // Render the application DOM.
  // Note that `navigation.ui.TopNavMenu` is a stateful component exported on the `navigation` plugin's start contract.
  return (
    <Router basename={basename}>
      <I18nProvider>
        <>
          <navigation.ui.TopNavMenu
            appName={PLUGIN_ID}
            showSearchBar={true}
          
	    showFilterBar={false}
	    showDatePicker={false}
            useDefaultBehaviors={true}
	    indexPatterns={indexPattern ? [indexPattern] : undefined}

 	    onQuerySubmit={onQuerySubmit}
            showSaveQuery={false}
//            query={kbnQuery}
          />
          <EuiPage restrictWidth="1200px">
            <EuiPageBody>
              <EuiPageHeader>
                <EuiTitle size="l">
                  <h1>
                    <FormattedMessage
                      id="searchForId.helloWorldText"
                      defaultMessage="{name}"
                      values={{ name: PLUGIN_NAME }}
                    />
                  </h1>
                </EuiTitle>
              </EuiPageHeader>
              <EuiPageContent>
                <EuiPageContentHeader>
                  <EuiTitle>
                    <h2>
                      <FormattedMessage
                        id="searchForId.congratulationsTitle"
                        defaultMessage="Enter an ID value"
                      />
                    </h2>
                  </EuiTitle>
                </EuiPageContentHeader>
                <EuiPageContentBody>

                  <EuiText>
                    <EuiHorizontalRule />
                    <p>
                    <Fragment>
	  	      <EuiFlexGroup>
		        <EuiFlexItem>
		          <EuiFieldSearch
                          id="searchField"
		        placeholder="Search..."
		        aria-label="Use aria labels when no actual label is in use"
		        />
		      </EuiFlexItem>
 		      <EuiFlexItem grow={false}>
                        <EuiButton type="primary" size="s" onClick={onSearchHandler}>
                          <FormattedMessage id="searchForId.buttonText" defaultMessage="Search" />
                        </EuiButton>
                      </EuiFlexItem>
		    </EuiFlexGroup>
		  </Fragment>	
                  </p>

		{showTable && (
		  <EuiDataGrid
		        aria-label="Data grid demo"
		        columns={columns}
		        columnVisibility={{ visibleColumns, setVisibleColumns }}
			rowCount= {hits.length}
			renderCellValue={({ rowIndex, columnId }) => {
	                    const hit = endData[rowIndex];
        	            if (hit && hit._source && hit._source[columnId]) {
     				 return hit._source[columnId];
			    } else {
			      return null; // Return null for missing data
  			  }
                	  }}
			inMemory={{ level: 'sorting' }}
		        sorting={{ columns: sortingColumns, onSort }}
			pagination={{
		          ...pagination,
		          pageSizeOptions: [100, 250, 1000],
		          onChangeItemsPerPage: onChangeItemsPerPage,
		          onChangePage: onChangePage,
		        }}
			height={3600}
		  />
		)}

                  </EuiText>

                </EuiPageContentBody>
              </EuiPageContent>
            </EuiPageBody>
          </EuiPage>
        </>
      </I18nProvider>
    </Router>
  );
};



