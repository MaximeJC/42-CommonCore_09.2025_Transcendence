fetch('http://localhost:3000/users/current?login=Alice')    
  .then(response => response.json())
  .then(data => console.log('Données utilisateur:', data))
  .catch(error => console.error('Erreur:', error));
