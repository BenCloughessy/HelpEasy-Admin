import { useEffect, useState } from "react";
import { Row, Col, Card, CardTitle, CardSubtitle, Button, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input } from "reactstrap";
import getRequestForms from "./getRequestForms";

function App() {
  const [requestForms, setRequestForms] = useState([])
  const [modal, setModal] = useState(false);

  // storing form info for request currently being viewed
  const [currentForm, setCurrentForm] = useState({})

  // Controlling form input for submission
  const [shelterName, setShelterName] = useState('')
  const [shelterAddress, setShelterAddress] = useState('')
  const [shelterCity, setShelterCity] = useState('')
  const [shelterState, setShelterState] = useState('')
  const [shelterPhone, setShelterPhone] = useState('')
  const [shelterUrl, setShelterUrl] = useState('')

  // Event handler for submission of controlled form. Call TomTom Geocoding API to get coords, then POST to /shelters, then DELETE from /requestforms
  const submitForm = async(shelterName, shelterAddress, shelterPhone, shelterUrl, shelterCity, shelterState, currentForm) => {
    setModal(!modal);

    // Call tomtom geocoding api to cobvert address into latitude and longitude 
    const apiKey = 'aWYBPDg8q4jsUHu3EViMzBg3kJi91gaV'
    let url = `https://api.tomtom.com/search/2/geocode/${shelterAddress}, ${shelterCity}, ${shelterState}.json?key=${apiKey}`
    
    const coords = await fetch(url, {
      method: 'GET',
      }).then((response) => response.json())

    // Send a POST request to /shelters, if successful, DELETE matching request form
    fetch('http://192.168.50.244:3001/shelters', {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            name: shelterName,
            url: shelterUrl,
            phone: shelterPhone,
            address: shelterAddress,
            city: shelterCity,
            state: shelterState,
            longitude: coords.results[0].position.lon, // longitude from call to TomTom geocoding api
            latitude: coords.results[0].position.lat   // latitude from call to TomTom geocoding api
        })
    }).then((response) => {
      if (!response.ok) {
        throw new Error('Network response was not OK');
      } else {
        fetch(`http://192.168.50.244:3001/requestforms/${currentForm._id}`, {
        method: 'DELETE',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        }
    }).then(() => {
      requestFormSearch() // refreshing current request forms after delete
    })
      }
    }).catch((error) => {
      console.error('There has been a problem with your fetch operation:', error);
    });
}

  // On opening the modal, also setting state to the current request form being accessed
  const toggleModal = (form) => {
    setCurrentForm(form)
    setModal(!modal);
  }

  // retrieving request forms from atlas database using custom getRequestForms()
  const requestFormSearch = async() => {
    let requestForms = await getRequestForms()
    setRequestForms(requestForms)
    console.log(requestForms)
    return requestForms
  }

  // Re-render list of request forms upon change in data
  useEffect(() => {
    requestFormSearch()
  }, [])
  

  return (
    <>

    {/* Render each request form as a card */}
    <Row className='ms-auto'>
      {requestForms.map( (form) => {
        return (
          <Col md='3' className='m-4' key={form._id}>
              <Card className="text-center" onClick={() => toggleModal(form)}>
                <CardTitle>{form.name}</CardTitle>
                <CardSubtitle>{form.city}, {form.state}</CardSubtitle>
              </Card>
          </Col>
        );
      })}
    </Row>

      {/* Modal containing submit form */}
    <Modal isOpen={modal} toggle={toggleModal}>
      <ModalHeader toggle={toggleModal}>Modal title</ModalHeader>
      <ModalBody>
        <Card>
          <CardTitle className="text-center">{currentForm.name}</CardTitle>
          <CardSubtitle className="text-center">{currentForm.city}, {currentForm.state}</CardSubtitle>
                <Input
                    type="text"
                    placeholder="Shelter Name"
                    value={shelterName}
                    onChange={(e) => setShelterName(e.target.value)}
                />
                <Input 
                    placeholder="Shelter Address" 
                    value={shelterAddress}
                    onChange={(e) => setShelterAddress(e.target.value)}
                />
                <Input 
                    placeholder="Shelter City" 
                    value={shelterCity}
                    onChange={(e) => setShelterCity(e.target.value)}
                />
                <Input 
                    placeholder="Shelter State" 
                    value={shelterState}
                    onChange={(e) => setShelterState(e.target.value)}
                />
                <Input 
                    placeholder="Shelter Phone"
                    value={shelterPhone}
                    onChange={(e) => setShelterPhone(e.target.value)}
                />
                <Input 
                    placeholder="Shelter Url"
                    value={shelterUrl}
                    onChange={(e) => setShelterUrl(e.target.value)}
                />
        </Card>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={() => submitForm(shelterName, shelterAddress, shelterPhone, shelterUrl, shelterCity, shelterState, currentForm)}>
          Submit
        </Button>{' '}
        <Button color="secondary" onClick={toggleModal}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
    </>
  );
}

export default App;