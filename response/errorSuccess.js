const errorResponse = (res, code, message, status) => {
   return  res.status(code).send({message,status })
}
const sucessResponse = (res, code, message, status,) => {
  return res.status(code).send({ message, status });
};


module.exports = {
    errorResponse,
    sucessResponse
}
