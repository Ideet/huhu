fetch('/creatoredgeservice/edge/creator-settlein/v2/organization/query',{
  method:'POST',
  headers:{
    'Content-Type':'application/json',
    'x-cs-csrf':sessionStorage['csrfToken'],
    'x-cs-csession':sessionStorage['csession'],
    'x-cs-date':new Date().toISOString().replace(/\D/g,'').slice(0,14)
  },
  body:JSON.stringify({organizationId:'1895576719210006912',businessType:9901,queryModel:'ALL'})
}).then(r=>r.text()).then(t=>alert(t))
