-- este é um arquivo para modelagem do banco de dados a ser inserido no dbdiagram.io







Table users {
  id integer [primary key, unique]
  username string
  email string [unique]
  password string
  createdAt timestamp
  updatedAt timestamp
  type enum ('admin', 'cliente') [default: 'cliente']
}

Table clients {
  id integer [primary key, unique]
  userId integer > users.id
  fullName string
  contact varchar(11)
  status boolean [default: true]
  createdAt timestamp
  updatedAt timestamp
}

Table adress {
  id integer [primary key, unique]
  clientId integer > clients.id
  cep varchar(8)
  logradouro string
  numero string
  complemento string
  bairro string
  cidade string
  estado string
  status boolean
  createdAt timestamp
  updatedAt timestamp
}

Table products {
  id integer [primary key, unique]
  name string
  description string
  price decimal
  stock integer
  status boolean [default: true]
  createdAt timestamp
  updatedAt timestamp
}

Table orders {
  id integer [primary key, unique]
  clientId integer > clients.id
  status enum ('Recebido', 'Em preparação', 'Despachado', 'Entregue') [default: 'Recebido']
  total decimal
  createdAt timestamp
  updatedAt timestamp
}

Table items {
  id integer [primary key, unique]
  orderId integer > orders.id
  productId integer > products.id
  quantity integer
  price decimal
  subtotal decimal
  createdAt timestamp
  updatedAt timestamp
}

-- relatorios
Table reports {
  id integer [primary key, unique]
  period timestamp
  totalSales decimal
  totalOrders integer
  path string
  createdAt timestamp
  updatedAt timestamp
}

Ref: clients.userId > users.id

Ref: adress.clientId > clients.id

Ref: orders.clientId > clients.id

Ref: items.orderId > orders.id

Ref: items.productId > products.id

