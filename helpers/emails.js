import nodemailer from 'nodemailer'

const emailRegistro= async (datos)=>{   
    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
      const {email,nombre,token} = datos
      //enviar mail
      await transport.sendMail({
        from: ' BienesRaices.com',
        to: email,
        subject:'Confirma tu cuenta en BienesRaices.com',
        text:'Confirma tu cuenta en BienesRaices.com',
        html:`
          <p> Hola ${nombre}, comprueba tu cuenta en BienesRaices.com</p>
          
          <p>Tu cuenta esta lista, solo debes confirmala con el siguiente enlace:
          <a href="${process.env.BACKEND_URL}:${process.env.PORT ?? 3000}/auth/confirmar/${token}">Confirmar Cuenta </a> </p>

          <p> Si tu no creaste esta cuenta, puedes ignorar el mensaje </p>
          `
      })
}

const emailOlvidePassword= async (datos)=>{   
  const transport = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    const {email,nombre,token} = datos
    //enviar mail
    await transport.sendMail({
      from: ' BienesRaices.com',
      to: email,
      subject:'Reestablece tu Passoword en BienesRaices.com',
      text:'Reestablece tu Passoword en BienesRaices.com',
      html:`
        <p> Hola ${nombre}, has solicitado reestablecer tu password  en BienesRaices.com</p>
        
        <p>sigue el siguiente enlace para generar un password nuevo:
        <a href="${process.env.BACKEND_URL}:${process.env.PORT ?? 3000}/auth/olvide-password/${token}">Reestablecer Password </a> </p>

        <p> Si tu no solicitaste el cambio de password, puedes ignorar el mensaje </p>
        `
    })
}


export {
    emailRegistro,
    emailOlvidePassword
}