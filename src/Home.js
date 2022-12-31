import { useEffect, useState } from "react";
import { Row, Col, Card, CardTitle, CardSubtitle, Button, Modal, ModalBody, ModalFooter, Input, Navbar, NavbarBrand } from "reactstrap";
import getRequestForms from "./getRequestForms";
import './App.css';


function Home() {
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

  // Event handler for submission of controlled form. 
  // Call TomTom Geocoding API to get coords, 
  // POST to /shelters, 
  // DELETE matching request form from /requestforms
  const submitForm = async(shelterName, shelterAddress, shelterPhone, shelterUrl, shelterCity, shelterState, currentForm) => {
    setModal(!modal);

    // Call tomtom geocoding api to convert address into latitude and longitude 
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
            poi: {
              name: shelterName,
              url: shelterUrl,
              phone: shelterPhone
            },
            address: {
              street: shelterAddress,
              city: shelterCity,
              state: shelterState,
              freeformAddress: `${shelterAddress}, ${shelterCity}, ${shelterState}`
            },
            location: { // send user coords as GeoJSON object for geospatial query on serverside
              type: "Point",
              coordinates: [coords.results[0].position.lon, coords.results[0].position.lat]
            },
            dist: 0
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

  return (
    <>
      <Navbar
          color="dark"
          dark
        >
          <NavbarBrand href="/">
            HelpEasy Admin
          </NavbarBrand>
        </Navbar>

      {/* Render each request form as a card */}
      <Row className='ms-auto justify-content-center'>
        {requestForms.map( (form) => {
          return (
            <Col md='3' className='m-4' key={form._id}>
                <Card className="text-center requestCard" onClick={() => toggleModal(form)}>
                  <CardTitle className="cardTitle">{form.name}</CardTitle>
                  <CardSubtitle className="cardSubtitle">{form.city}, {form.state}</CardSubtitle>
                </Card>
            </Col>
          );
        })}
      </Row>

        {/* Modal containing submit form */}
      <Modal isOpen={modal} toggle={toggleModal}>
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
          <Button color="secondary" onClick={toggleModal}>
            Cancel
          </Button>
          <Button color="primary" onClick={() => submitForm(shelterName, shelterAddress, shelterPhone, shelterUrl, shelterCity, shelterState, currentForm)}>
            Submit
          </Button>{' '}
        </ModalFooter>
      </Modal>
    </>
  );
}

export default Home;