import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, Building2 } from 'lucide-react';
import { Container, Row, Col, Card, Button, Form, Alert, Badge, Navbar, Spinner } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <Router>
      <div className="min-vh-100 bg-light">
        <Navbar bg="white" className="shadow-sm">
          <Container>
            <Navbar.Brand className="fw-bold text-primary">Uganda Directory</Navbar.Brand>
          </Container>
        </Navbar>
        <Routes>
          <Route path="/" element={<RegionsPage />} />
          <Route path="/region/:region" element={<DistrictsPage />} />
          <Route path="/region/:region/district/:district" element={<DistrictDetailPage />} />
        </Routes>
      </div>
    </Router>
  );
}
const data = {
  "regions": {
    "Western": {
      "districts": [
        {
          "name": "Mbarara",
          "phone_numbers": ["+256701123456", "+256772234567"]
        },
        {
          "name": "Kabale",
          "phone_numbers": ["+256701654321", "+256772765432"]
        }
      ]
    },
    "Eastern": {
      "districts": [
        {
          "name": "Jinja",
          "phone_numbers": ["+256703123456", "+256775234567"]
        },
        {
          "name": "Mbale",
          "phone_numbers": ["+256703654321", "+256775765432"]
        }
      ]
    },
    "Northern": {
      "districts": [
        {
          "name": "Gulu",
          "phone_numbers": ["+256702123456", "+256774234567"]
        },
        {
          "name": "Lira",
          "phone_numbers": ["+256702654321", "+256774765432"]
        }
      ]
    },
    "Central": {
      "districts": [
        {
          "name": "Kampala",
          "phone_numbers": ["+256704123456", "+256776234567"]
        },
        {
          "name": "Wakiso",
          "phone_numbers": ["+256704654321", "+256776765432"]
        }
      ]
    }
  }
};


function RegionsPage() {
  const navigate = useNavigate();

  return (
    <Container className="py-5">
      <div className="text-center mb-5">
        <div className="mb-4">
          <MapPin size={48} className="text-primary" />
        </div>
        <h1 className="display-4 fw-bold mb-3">Explore Uganda's Regions</h1>
        <p className="text-muted lead">Discover districts and contact information across Uganda's regions</p>
      </div>

      <Row className="g-4">
        {Object.keys(data.regions).map((region) => (
          <Col key={region} xs={12} md={6} lg={3}>
            <Card
              className="h-100 border-0 shadow-sm"
              style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
              onClick={() => navigate(`/region/${region}`)}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <Card.Body className="text-center">
                <Building2 size={48} className="mb-3 text-primary" />
                <Card.Title className="h4 mb-3">{region}</Card.Title>
                <Badge bg="secondary" pill>
                  {data.regions[region].districts.length} Districts
                </Badge>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}

function DistrictsPage() {
  const { region } = useParams();
  const navigate = useNavigate();

  if (!data.regions[region]) {
    return <div>Region not found</div>;
  }

  return (
    <Container className="py-5">
      <Button
        variant="link"
        className="mb-4 text-decoration-none"
        onClick={() => navigate('/')}
      >
        <ArrowLeft className="me-2" />
        Back to Regions
      </Button>

      <div className="text-center mb-5">
        <div className="mb-4">
          <Building2 size={48} className="text-primary" />
        </div>
        <h1 className="display-4 fw-bold mb-3">{region} Region</h1>
        <p className="text-muted lead">Select a district to view contact information</p>
      </div>

      <Row className="g-4">
        {data.regions[region].districts.map((district) => (
          <Col key={district.name} xs={12} md={6} lg={4}>
            <Card
              className="h-100 border-0 shadow-sm"
              style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
              onClick={() => navigate(`/region/${region}/district/${district.name}`)}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <Card.Body className="text-center">
                <MapPin size={48} className="mb-3 text-success" />
                <Card.Title className="h4 mb-3">{district.name}</Card.Title>
                <Badge bg="primary" pill>
                  {district.phone_numbers.length} Contacts
                </Badge>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}

const API_BASE_URL = 'POST http://localhost:3005/api/districts/broadcast-sms';

async function addPhoneNumber(region, district, phoneNumber) {
  try {
    const response = await fetch(`${API_BASE_URL}/districts/${district}/phone-numbers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        region,
        district,
        phoneNumber,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to add phone number');
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

async function broadcastSMS(region, district, phoneNumbers) {
  try {
    const response = await fetch(`http://localhost:3005/api/districts/broadcast-sms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        region,
        district,
        phoneNumbers,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.log(errorData.message);
      throw new Error(errorData.message || 'Failed to send SMS broadcast');
    }

    return await response.json();
  } catch (error) {
    console.log(error.message);
    throw error;
  }
}

function DistrictDetailPage() {
  const { region, district } = useParams();
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneNumbers, setPhoneNumbers] = useState(
    data.regions[region]?.districts.find(d => d.name === district)?.phone_numbers || []
  );
  const [isAddingNumber, setIsAddingNumber] = useState(false);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [alert, setAlert] = useState(null);

  if (!data.regions[region]) {
    return <div>Region not found</div>;
  }

  const districtData = data.regions[region].districts.find(
    d => d.name === district
  );

  if (!districtData) {
    return <div>District not found</div>;
  }

  const validatePhoneNumber = (number) => {
    const ugandaPhoneRegex = /^\+256[7][0-9]{8}$/;
    return ugandaPhoneRegex.test(number);
  };

  const handleAddNumber = async (e) => {
    e.preventDefault();

    if (!validatePhoneNumber(phoneNumber)) {
      setAlert({
        type: 'danger',
        message: 'Please enter a valid Uganda phone number (format: +256XXXXXXXXX)'
      });
      return;
    }

    try {
      setIsAddingNumber(true);
      setAlert(null);

      await addPhoneNumber(region, district, phoneNumber);

      // Update local state
      setPhoneNumbers([...phoneNumbers, phoneNumber]);
      setPhoneNumber('');

      setAlert({
        type: 'success',
        message: 'Phone number successfully added to the broadcast list!'
      });

      setTimeout(() => setAlert(null), 3000);

    } catch (error) {
      setAlert({
        type: 'danger',
        message: error.message || 'Failed to add phone number. Please try again.'
      });
    } finally {
      setIsAddingNumber(false);
    }
  };

  const handleBroadcast = async () => {
    if (phoneNumbers.length === 0) {
      setAlert({
        type: 'warning',
        message: 'No phone numbers in the broadcast list.'
      });
      return;
    }

    if (!window.confirm(`Are you sure you want to send an SMS broadcast to ${phoneNumbers.length} recipients?`)) {
      return;
    }

    try {
      setIsBroadcasting(true);
      setAlert(null);

      const response = await broadcastSMS(region, district, phoneNumbers);
      console.log(response);

      setAlert({
        type: 'success',
        message: 'SMS broadcast initiated successfully! Recipients will receive the message shortly.'
      });

      setTimeout(() => setAlert(null), 3000);

    } catch (error) {
      setAlert({
        type: 'danger',
        message: error.message || 'Failed to send SMS broadcast. Please try again.'
      });
    } finally {
      setIsBroadcasting(false);
    }
  };

  return (
    <Container className="py-5">
      <Button
        variant="link"
        className="mb-4 text-decoration-none"
        onClick={() => navigate(`/region/${region}`)}
        disabled={isAddingNumber || isBroadcasting}
      >
        <ArrowLeft className="me-2" />
        Back to {region} Districts
      </Button>

      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="border-0 shadow">
            <Card.Header className="bg-white border-0 pt-4">
              <div className="d-flex align-items-center text-muted mb-2">
                <MapPin size={16} className="me-2" />
                <span className="small">{region} Region / {district} District</span>
              </div>
              <h2 className="h3 mb-2">SMS Broadcasting System</h2>
              <p className="text-muted mb-0">Manage broadcast list and send SMS to all recipients</p>
            </Card.Header>
            <Card.Body>
              {alert && (
                <Alert variant={alert.type} className="mb-4">
                  {alert.message}
                </Alert>
              )}

              <Form onSubmit={handleAddNumber} className="mb-5">
                <Form.Group className="mb-3">
                  <Form.Label>Add New Phone Number to Broadcast List</Form.Label>
                  <div className="d-flex gap-2">
                    <Form.Control
                      type="tel"
                      placeholder="+256701234567"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      required
                      pattern="\+256[7][0-9]{8}"
                      disabled={isAddingNumber || isBroadcasting}
                    />
                    <Button
                      type="submit"
                      variant="outline-primary"
                      disabled={isAddingNumber || isBroadcasting}
                    >
                      {isAddingNumber ? (
                        <>
                          <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                            className="me-2"
                          />
                          Adding...
                        </>
                      ) : (
                        'Add Number'
                      )}
                    </Button>
                  </div>
                  <Form.Text className="text-muted">
                    Format: +256XXXXXXXXX (Uganda phone number)
                  </Form.Text>
                </Form.Group>
              </Form>

              <h4 className="mb-4">Broadcast Recipients</h4>
              {phoneNumbers.length === 0 ? (
                <Alert variant="info">
                  No phone numbers are currently registered for SMS broadcasts in this district.
                </Alert>
              ) : (
                <div className="d-flex flex-column gap-2">
                  <Alert variant="info" className="mb-3">
                    Recipients in broadcast list: {phoneNumbers.length}
                  </Alert>
                  {phoneNumbers.map((phone, index) => (
                    <Card
                      key={index}
                      className="bg-light border-0"
                    >
                      <Card.Body className="d-flex align-items-center py-2">
                        <Phone size={20} className="text-muted me-3" />
                        <span className="fw-medium">{phone}</span>
                      </Card.Body>
                    </Card>
                  ))}

                  <div className="d-grid mt-4">
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={handleBroadcast}
                      disabled={isBroadcasting || isAddingNumber}
                    >
                      {isBroadcasting ? (
                        <>
                          <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                            className="me-2"
                          />
                          Sending Broadcast...
                        </>
                      ) : (
                        'Send SMS Broadcast to All Recipients'
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}


export default App;