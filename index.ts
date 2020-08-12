import express from "express";
import bodyParser from "body-parser";

const app = express();
const port = 8080; // default port

app.use(bodyParser.json());

const parseRequestData = (version: number, data: any) => {
	// Assuming data is of format <firstName>000<lastName>000<clientId>
	const delimiter = '0';

	let firstName;
	let lastName;
	let clientId;

	const length = data.length;
	let index = 0;
	let currentIndex = 0;
	let hasZeroStarted = false;
	let delimitedString = '';

	while(index<length) {
		if(hasZeroStarted && data[index]!=='0') {
			hasZeroStarted = false;
			delimitedString += data.substring(currentIndex, index) + ';';
			currentIndex = index;
		}
		else if(!hasZeroStarted && data[index]==='0') {
			hasZeroStarted = true;
		}
		index++;
	}

	delimitedString += data.substring(currentIndex, index);

	const responseArray = delimitedString.split(';');

	if(version === 1) {
		return {
			firstName: responseArray[0],
			lastName: responseArray[1],
			clientId: responseArray[2]
		};
	}
	else if(version === 2) {
		const firstName = responseArray[0].substring(0, responseArray[0].indexOf('0'));
		const lastName = responseArray[1].substring(0, responseArray[1].indexOf('0'));
		
		return {
			firstName,
			lastName,
			clientId: responseArray[2]!.match(/.{1,3}/g)!.join('-')
		}
	}
	else {
		throw new Error("Invalid version"); 
	}

}

app.post('/api/v1/parse', (req, res) => {
	const {data} = req.body;

	if(!data || !data.length) {
		return res.status(400).json({
			statusCode: 400,
			data: {
				error: 'Invalid body format'
			}
		});
	}

	return res.status(200).json({
		statusCode: 200,
		data: parseRequestData(1, data)
	});
});

app.post('/api/v2/parse', (req, res) => {
	const {data} = req.body;

	if(!data || !data.length) {
		return res.status(400).json({
			statusCode: 400,
			data: {
				error: 'Invalid body format'
			}
		});
	}

	return res.status(200).json({
		statusCode: 200,
		data: parseRequestData(2, data)
	})
});

app.listen(port, () => {
	console.log(`Server started on localhost:${port}`);
});
exports=  parseRequestData