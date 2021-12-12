import React, { useState, useEffect } from "react";
import { Modal, Button, Form, InputGroup, Col, Row, Table } from 'react-bootstrap';
import L from 'leaflet';
import gasPin from './assets/gas-station-pin.png';
import gasPinAdd from './assets/gas-station-pin-add.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import { MapContainer, TileLayer, Marker, Popup, useMapEvent } from 'react-leaflet';
import { format, addHours } from 'date-fns';
import { useServer, getUpdatesFromServer, addPosto, addPreco } from './serverConn.js';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'leaflet/dist/leaflet.css';
import './App.css';

const INITIAL_POSITION = [-22.4232174, -45.4568564];
const INITIAL_ZOOM = 16;

let DefaultIcon = L.icon({
  iconUrl: gasPin,
  shadowUrl: iconShadow,
  iconSize: [42, 41],
  iconAnchor: [18, 41],
  popupAnchor: [1, -45],
  shadowSize: [41, 41]
});

let AddIcon = L.icon({
  iconUrl: gasPinAdd,
  shadowUrl: iconShadow,
  iconSize: [42, 41],
  iconAnchor: [18, 41],
  popupAnchor: [1, -45],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

function MapAddPosto() {
  const [center, setCenter] = useState(null);
  const [nome, setNome] = useState('');

  useMapEvent('click', (event) => {
    if (!center) {
      setCenter(event.latlng);
    } else {
      setCenter(null);
    }
  })

  if (!center) {
    return null;
  }

  return <Marker position={center} icon={AddIcon}>
    <Popup keepInView>
      <input type="text" placeholder="Nome do posto" value={nome} onChange={(e) => setNome(e.target.value)} />
      <button onClick={() => {
        addPosto({ nome, lat: center.lat, long: center.lng });
        setCenter(null);
        setNome('');
        getUpdatesFromServer();
      }}>Registrar</button>
    </Popup>
  </Marker>;
}

function Postos(props) {
  const { data } = props;
  const [postoActive, setPostoActive] = useState(null);

  if (!data?.postos) {
    return null;
  }

  return <>
    <PostoModal show={!!postoActive} data={data} posto={postoActive} onClose={() => setPostoActive(null)} />
    {data?.postos.map((posto) => <Marker key={posto.id} position={[posto.latitude, posto.longitude]} icon={DefaultIcon}
      eventHandlers={{
        click: () => { setPostoActive(posto); }
      }}
    ></Marker>)}
  </>;
}

function PostoModal(props) {
  const { show, onClose, data, posto } = props;
  const { combustiveis, precos } = data;

  const [tipoComb, setTipoComb] = useState(combustiveis?.[0]?.id ?? 1);
  const [preco, setPreco] = useState('');

  if (!show || !data) {
    return null;
  }

  const handleAdd = () => {
    if (!preco || !tipoComb) {
      return;
    }

    addPreco({
      posto: posto.id,
      tipoComb: parseInt(tipoComb),
      data: format(new Date(), 'yyyy-MM-dd'),
      preco: parseFloat(preco)
    });
    setTipoComb(combustiveis?.[0]?.id ?? 1);
    setPreco('');
    getUpdatesFromServer();
  }

  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>{posto.nome}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Row>
            <Col md={5}>
              <Form.Group className="mb-3">
                <Form.Label>Preço do Combustível</Form.Label>
                <InputGroup className="mb-2">
                  <InputGroup.Text>R$</InputGroup.Text>
                  <Form.Control type="number" placeholder="Preço" value={preco} onChange={(e) => setPreco(e.target.value)} />
                </InputGroup>
              </Form.Group>
            </Col>

            <Col md={5}>
              <Form.Group className="mb-3">
                <Form.Label>Tipo de Combustível</Form.Label>
                <Form.Select value={tipoComb} onChange={(e) => setTipoComb(e.target.value)}>
                  {combustiveis.map((combustivel) => <option key={combustivel.id} value={combustivel.id}>{combustivel.nome}</option>)}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={2}>
              <Form.Group className="mb-3">
                <Form.Label>&nbsp;</Form.Label><br />
                <Button variant="primary" onClick={handleAdd}>
                  +
                </Button>
              </Form.Group>
            </Col>
          </Row>
        </Form>
        <hr />
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Data</th>
              <th>Tipo</th>
              <th>Preço</th>
            </tr>
          </thead>
          <tbody>
            {precos.filter((preco) => preco.idPosto === posto.id).map((preco) => <tr key={preco.id}>
              <td>{format(addHours(new Date(preco.data), 5), 'dd/MM/yyyy')}</td>
              <td>{combustiveis?.find(comb => comb.id === preco.idTipo)?.nome}</td>
              <td>R$ {preco.preco?.toFixed(2)}</td>
            </tr>)}
          </tbody>
        </Table>
      </Modal.Body >
    </Modal >
  );
}

function App() {
  const data = useServer();
  console.log(data);

  useEffect(() => {
    getUpdatesFromServer();
  }, []);

  return (
    <div className="App">
      <MapContainer
        center={INITIAL_POSITION}
        zoom={INITIAL_ZOOM}
      >
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Postos data={data} />
        <MapAddPosto />
      </MapContainer >
    </div >
  );
}

export default App;
