import {
  Form,
  FormLayout,
  Page,
  Layout,
  Card,
  TextField,
  Stack,
  Button,
} from "@shopify/polaris";
import { useEffect, useState, useCallback, useContext } from "react";
import { Redirect } from "@shopify/app-bridge/actions";
import UserContext from "../components/UserContext";
import { Context } from "@shopify/app-bridge-react";
import { getFirestore } from "../firebase";

const EditShippingAddress = () => {
  const [shipdata, setShipdata] = useContext(UserContext);
  const app = useContext(Context);
  const db = getFirestore();

  const [form, setForm] = useState({
    tipoProducto: "CP",
    largo: "",
    ancho: "",
    alto: "",
    peso: "",
    valor: "",
    provincia: "",
    sucursal: "",
    localidad: "",
    calle: "",
    altura: "",
    piso: "",
    depto: "",
    codigoPostal: "",
    destinatario: "",
    email: "",
    codAreaTel: "",
    tel: "",
    codAreaCel: "",
    cel: "",
  });

  const { name, subtotalPrice, customer, shippingAddress } = shipdata.selected;

  const handleChange = (value, id) => {
    const field = id;
    setForm({ ...form, [field]: value });
  };

  function removeAcentos(w) {
    if (w == null) {
      return "";
    }
    return w
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9 ]/g, "");
  }

  useEffect(() => {
    const pedido = removeAcentos(name);

    db.collection("rotulos")
      .doc(pedido)
      .get()
      .then((doc) => {
        if (doc.exists) {
          setForm(doc.data());
        } else {
          const subTotalAmmount = subtotalPrice.substring(
            0,
            subtotalPrice.length - 3
          );
          const cliente = removeAcentos(shippingAddress.name);
          const localidad = removeAcentos(shippingAddress.city);
          const calle = removeAcentos(
            `${shippingAddress.address1} ${shippingAddress.address2}`
          );
          const fullcel = removeAcentos(shippingAddress.phone).replace(
            / /g,
            ""
          );
          const cel = fullcel.substr(-8);
          const codAreaCel = fullcel.substring(0, fullcel.length - 8);

          setForm({
            tipoProducto: "CP",
            largo: "30",
            ancho: "30",
            alto: "30",
            peso: "1",
            valor: subTotalAmmount,
            provincia: shippingAddress.provinceCode,
            sucursal: "",
            localidad: localidad,
            calle: calle,
            altura: "0",
            piso: "",
            depto: "",
            codigoPostal: shippingAddress.zip,
            destinatario: `${cliente} PEDIDO${pedido}`,
            email: customer.email,
            codAreaTel: "",
            tel: "",
            codAreaCel: codAreaCel,
            cel: cel,
          });
        }
      });
  }, []);

  useEffect(() => {
    console.log(form);
  }, [form]);

  const redirectToMain = () => {
    const redirect = Redirect.create(app);
    redirect.dispatch(Redirect.Action.APP, "/");
  };

  const handleSubmit = (e) => {
    db.collection("rotulos")
      .doc(removeAcentos(name))
      .set(form)
      .then(() => redirectToMain());
  };

  return (
    <Page>
      <Layout>
        <Layout.AnnotatedSection
          title="Default discount"
          description="Add a product to Sample App, it will automatically be discounted."
        >
          <Card>
            <Form onSubmit={handleSubmit}>
              <FormLayout>
                <Card.Section title="Dirección">
                  <Stack distribution="fillEvenly">
                    <TextField
                      label="Provincia"
                      type="text"
                      id="provincia"
                      value={form.provincia}
                      disabled
                    />
                    <TextField
                      label="Localidad"
                      type="text"
                      id="localidad"
                      value={form.localidad}
                      onChange={handleChange}
                    />
                    <TextField
                      value={form.codigoPostal}
                      label="Codigo Postal"
                      type="text"
                      id="codigoPostal"
                      onChange={handleChange}
                    />
                  </Stack>
                  <TextField
                    label="Calle"
                    type="text"
                    value={form.calle}
                    id="calle"
                    onChange={handleChange}
                  />
                  <TextField
                    label="Altura"
                    type="text"
                    id="altura"
                    value={form.altura}
                    onChange={handleChange}
                  />
                  <Stack distribution="fillEvenly">
                    <TextField
                      label="Piso"
                      type="discount"
                      id="piso"
                      value={form.piso}
                      onChange={handleChange}
                    />
                    <TextField
                      label="Depto"
                      type="discount"
                      value={form.depto}
                      id="depto"
                      onChange={handleChange}
                    />
                  </Stack>
                </Card.Section>
                <Card.Section title="Contacto">
                  <TextField
                    label="Destinatario"
                    type="text"
                    id="destinatario"
                    placeholder="h"
                    onChange={(value, id) => handleChange(value, id)}
                    value={form.destinatario}
                  />
                  <Stack distribution="fillEvenly">
                    <TextField
                      label="Email"
                      type="discount"
                      id="email"
                      value={form.email}
                      onChange={(value, id) => handleChange(value, id)}
                    />
                    <Stack distribution="fillEvenly">
                      <TextField
                        label="Código Area"
                        type="discount"
                        id="codAreaCel"
                        onChange={handleChange}
                        value={form.codAreaCel}
                      />
                      <TextField
                        label="Celular"
                        type="discount"
                        id="cel"
                        value={form.cel}
                        onChange={handleChange}
                      />
                    </Stack>
                  </Stack>
                </Card.Section>

                <Card.Section title="Paquete">
                  <TextField
                    label="Peso (kg)"
                    type="text"
                    value={form.peso}
                    id="peso"
                    onChange={handleChange}
                  />
                  <TextField
                    label="Valor del contenido"
                    type="text"
                    id="text"
                    value={form.valor}
                    onChange={(value, id) => handleChange(value, id)}
                  />
                  <Stack distribution="fillEvenly">
                    <Stack>
                      <TextField
                        label="Largo (cm)"
                        type="discount"
                        id="largo"
                        value={form.largo}
                        onChange={(value, id) => handleChange(value, id)}
                      />
                    </Stack>
                    <Stack distribution="fillEvenly">
                      <TextField
                        label="Ancho (cm)"
                        type="discount"
                        id="ancho"
                        onChange={handleChange}
                        value={form.ancho}
                      />
                      <TextField
                        label="Alto (cm)"
                        type="discount"
                        id="alto"
                        value={form.alto}
                        onChange={handleChange}
                      />
                    </Stack>
                  </Stack>
                </Card.Section>
                <Card.Section>
                  <Stack distribution="trailing">
                    <Button primary={false} onClick={() => redirectToMain()}>
                      Cancelar
                    </Button>
                    <Button primary submit>
                      Save
                    </Button>
                  </Stack>
                </Card.Section>
              </FormLayout>
            </Form>
          </Card>
        </Layout.AnnotatedSection>
      </Layout>
    </Page>
  );
};

export default EditShippingAddress;
