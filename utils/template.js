export default [
  {
    name: "tipo_producto(obligatorio)",
    value: "CP",
  },
  {
    name: "largo(obligatorio en CM)",
    value: "30"
  },
  {
    name: "ancho(obligatorio en CM)",
    value: "30"
  },
  {
    name: "altura(obligatorio en CM)",
    value: "30"
  },
  {
    name: "peso(obligatorio en KG)",
    format: (row) => row.peso,
  },
  {
    name: "valor_del_contenido(obligatorio en pesos argentinos)",
    format: (row) => row.valor,
  },
  {
    name: "provincia_destino(obligatorio)",
    format: (row) => row.provincia,
  },
  {
    name:
      "sucursal_destino(obligatorio solo en caso de no ingresar localidad de destino)",
    value: "",
  },
  {
    name:
      "localidad_destino(obligatorio solo en caso de no ingresar sucursal de destino)",
    format: (row) => row.localidad,
  },
  {
    name:
      "calle_destino(obligatorio solo en caso de no ingresar sucursal de destino)",
    format: (row) => row.calle,
  },
  {
    name:
      "altura_destino(obligatorio solo en caso de no ingresar sucursal de destino)",
    format: (row) => row.altura,
  },
  {
    name: "piso(opcional solo en caso de no ingresar sucursal de destino)",
    format: (row) => row.piso,
  },
  {
    name: "dpto(opcional solo en caso de no ingresar sucursal de destino)",
    format: (row) => row.depto,
  },
  {
    name:
      "codpostal_destino(obligatorio solo en caso de no ingresar sucursal de destino)",
    format: (row) => row.codigoPostal,
  },
  {
    name: "destino_nombre(obligatorio)",
    format: (row) => row.destinatario,
  },
  {
    name: "destino_email(obligatorio, debe ser un email valido)",
    format: (row) => row.email,
  },
  {
    name: "cod_area_tel(opcional)",
    value: "",
  },
  {
    name: "tel(opcional)",
    value: "",
  },
  {
    name: "cod_area_cel(obligatorio)",
    format: (row) => row.codAreaCel,
  },
  {
    name: "cel(obligatorio)",
    format: (row) => row.cel,
  },
];
