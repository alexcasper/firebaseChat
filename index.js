// This is just a fancy minimalist express server.
          const express = require('express');
              const app = express()
                const port = 3000
                 console.log(app)
          app.use(express.static('public'))
     app.get('/',(req,res)=>res.send('./index.html'))
app.listen(port,()=>console.log(`listening at ${port}`))

