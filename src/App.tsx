import "./styles.css";
import "bootstrap/dist/css/bootstrap.min.css";

import { useState } from "react";
import { Query, QueryBuilder, SetEnv } from "./api";
import { Stack, Button, Form, InputGroup } from "react-bootstrap";

export default function App() {
  const [env, setEnv] = useState({
    host: "https://demo.timeplus.cloud",
    tenant: "marketdata",
    apiKey: "",
  });

  const [querySQL, setQuerySQL] = useState(
    "SELECT * FROM mv_coinbase_tickers_extracted"
  );

  const [currentQuery, setCurrentQuery] = useState<Query>(null);
  const [queryResult, setQueryResult] = useState([]);
  
  const tableLimit = 10;
  const runQuery = async function () {
    if (currentQuery) {
      currentQuery.close();
    }

    SetEnv(env);
    let queryResultAll = [];
    const builder = new QueryBuilder();
    builder
      .withSQL(querySQL)
      .withOnRows((rows) => {
        //console.log("received rows", rows);
        queryResultAll = [...queryResultAll, ... rows]
        setQueryResult(queryResultAll.slice(-tableLimit));
      })
      .withOnError((error) => {
        console.error("on error", error);
      })
      .withOnMetrics((metrics) => {
        console.debug("received metrics", metrics);
      });

    const query = await builder.start();
    if (!(query instanceof Query)) {
      console.error("oops", query);
      return;
    }
    setCurrentQuery(query);
  };

  const cancelQuery = function () {
    if (currentQuery) {
      currentQuery.close();
    }
  };

  return (
    <div
      style={{ width: "100vh", margin: "auto", marginTop: 20, marginLeft: 20 }}
    >
      <h1>Timeplus Query API</h1>
      <Stack gap={1}>
        <InputGroup size="sm" className="mb-3">
          <InputGroup.Text id="inputGroup-address">Address</InputGroup.Text>
          <Form.Control
            aria-label="Small"
            aria-describedby="inputGroup-sizing-sm"
            defaultValue={env.host}
            onChange={(e) => setEnv({ ...env, host: e.target.value })}
          />
        </InputGroup>
        <InputGroup size="sm" className="mb-3">
          <InputGroup.Text id="inputGroup-tenant">Tenant</InputGroup.Text>
          <Form.Control
            aria-label="Small"
            aria-describedby="inputGroup-sizing-sm"
            defaultValue={env.tenant}
            onChange={(e) => setEnv({ ...env, tenant: e.target.value })}
          />
        </InputGroup>
        <InputGroup size="sm" className="mb-3">
          <InputGroup.Text id="inputGroup-apikey">API Key</InputGroup.Text>
          <Form.Control
            aria-label="Small"
            aria-describedby="inputGroup-sizing-sm"
            type="password"
            defaultValue={env.apiKey}
            onChange={(e) => setEnv({ ...env, apiKey: e.target.value })}
          />
        </InputGroup>
        <InputGroup size="sm" className="mb-3">
          <InputGroup.Text id="inputGroup-query">Query SQL</InputGroup.Text>
          <Form.Control
            aria-label="Small"
            aria-describedby="inputGroup-sizing-sm"
            defaultValue={querySQL}
            onChange={(e) => setQuerySQL(e.target.value)}
          />
        </InputGroup>
        <Stack direction="horizontal" gap={3}>
          <Button variant="primary" size="sm" onClick={(e) => runQuery()}>
            Run
          </Button>
          <Button variant="primary" size="sm" onClick={(e) => cancelQuery()}>
            Cancel
          </Button>
        </Stack>
        <table id="customers">
          <tr>
            {currentQuery && 
              currentQuery.header.map((e) => {
                return (<th>{e.name.toString()}</th>);
              })
            }
          </tr>
          {
            queryResult.map((row) => {
              return (<tr>
                {
                  row.map((cell) => {
                    return <td>{cell}</td>
                  })
                }
                </tr>);
            })
          }
        </table>
      </Stack>
    </div>
  );
}
