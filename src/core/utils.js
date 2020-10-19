
//VALIDADOR DE EMAIL
export const emailValidator = email => {
  const re = /\S+@\S+\.\S+/;

  if (!email || email.length <= 0) return 'Email não pode estar vazio.';
  if (!re.test(email)) return 'Ooops! Precisamos de um Email válido.';

  return '';
};

//VALIDADOR DE GÊNERO
export const sexValidator = sex => {
  if (!sex || sex.length <= 0) return 'Sexo não pode estar vazio.';

  return '';
};

//VALIDADOR DE NOME
export const nameValidator = name => {
  if (!name || name.length <= 0) return 'Nome não pode estar vazio.';

  return '';
};
