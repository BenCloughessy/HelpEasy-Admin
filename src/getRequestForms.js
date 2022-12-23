
const getRequestForms = async() => {
    const requestForms = await fetch('http://192.168.50.244:3001/requestforms', {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
        }
    }).then((response) => response.json())

    return requestForms

}

export default getRequestForms
 