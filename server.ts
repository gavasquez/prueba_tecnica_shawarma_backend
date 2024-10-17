import express from "express";
import cors from "cors";
import multer from "multer";
import csvToJson from "convert-csv-to-json";


const app = express();

const port = process.env.PORT ?? 3000; // Port to listen on

const storage = multer.memoryStorage()
const upload = multer({ storage })

let userData: Array<Record<string, string>> = [];

app.use(cors());

app.post('/api/files', upload.single('file') , async (req, res): Promise<any> => {
   // 1. Extraer el archivo de la request
   const { file } = req;
   // 2. Validar el archivo
   if(!file) {
     return res.status(500).json({ message: 'File is required' });
   }
   // 3. Validar el mimetype
   if(file.mimetype !==  'text/csv') {
     return res.status(500).json({ message: 'File must be a CSV' });
   }
   let json: Array<Record<string, string>> = [];

   try {
     // 4. Transform el archilo a to json
    const rawCsv = Buffer.from(file.buffer).toString('utf-8');
    console.log(rawCsv)
    // 5. Transform string to CSV
    json = csvToJson.csvStringToJson(rawCsv);
   } catch (error) {
    return res.status(500).json({ message: 'Error converting file to JSON' });
   }
   //  6. Guardar el archivo JSON
   userData = json;
   // 7. retorn 200 con el mensaje y el JSON
   return res.status(200).json({ data: json, message: 'El archivo se cargó correctamente'})
});

app.get('/api/files', async (req, res): Promise<any> => {
  // 1. Extraer la query p de parametros
  const { q } = req.query;
  // 2. Validar los parametros
  if(!q) { return res.status(500).json({ message: 'Query param is required' }) }

  if(Array.isArray(q)) {
    return res.status(500).json({ message: 'Query param must be a string' });
  }
  // 3. Filtrar la informacion en  la base de datos
  const search = q.toString().toLowerCase();

  const filteredData = userData.filter( row => {
    return Object.values(row).some(value => value.toLowerCase().includes(search));
  });
  return res.status(200).json({ data: filteredData})
});


app.listen( port, () => {
  console.log(`Server running on port ${port}`);
});