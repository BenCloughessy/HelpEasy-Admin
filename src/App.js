import { useEffect, useState } from "react";
import { Row, Col, Card, CardTitle, CardSubtitle } from "reactstrap";
import getRequestForms from "./getRequestForms";

function App() {
  const [requestForms, setRequestForms] = useState([])

  const requestFormSearch = async() => {
    let requestForms = await getRequestForms()
    setRequestForms(requestForms)
    console.log(requestForms)
    return requestForms
  }

  useEffect(() => {
    requestFormSearch()
  }, [requestForms.length])
  

  return (
    <Row className='ms-auto'>
      {requestForms.map( (form) => {
        return (
          <Col md='3' className='m-4' key={form.id}>
              <Card>
                <CardTitle>{form.name}</CardTitle>
                <CardSubtitle>{form.city}, {form.state}</CardSubtitle>
              </Card>
          </Col>
        );
      })}
    </Row>
  );
}

export default App;