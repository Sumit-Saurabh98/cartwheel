export const products = [
  { id: 'p_1', name: 'Mechanical keyboard', price: 89.99 },
  { id: 'p_2', name: 'Desk mat', price: 40.0 },
  { id: 'p_3', name: 'USB-C cable', price: 9.99 },
  { id: 'p_4', name: 'Laptop stand', price: 34.5 },
  { id: 'p_5', name: 'Webcam cover', price: 2.99 },
  { id: 'p_6', name: 'Wireless mouse', price: 25.0 },
  { id: 'p_7', name: 'Cable ties (20)', price: 4.5 },
  { id: 'p_8', name: 'Monitor light', price: 59.0 },
  { id: 'p_9', name: 'Sticky notes', price: 7.25 },
  { id: 'p_10', name: 'Notebook', price: 12.75 },
  { id: 'p_11', name: 'Headphone hook', price: 15.0 },
  { id: 'p_12', name: 'Coffee mug', price: 19.99 },
];

export const findProduct = (id) => products.find((p) => p.id === id);
