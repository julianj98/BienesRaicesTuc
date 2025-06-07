import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API);

const emailRegistro = async (datos) => {   
    const {email, nombre, token} = datos;
    
    // Construir la URL de confirmación
    const confirmarUrl = `${process.env.BACKEND_URL}/auth/confirmar/${token}`;
    console.log('URL de confirmación:', confirmarUrl);
    
    try {
        await resend.emails.send({
            from: 'BienesRaices <onboarding@resend.dev>',
            to: email,
            subject: 'Confirma tu cuenta en BienesRaices.com',
            html: `
                <p>Hola ${nombre}, comprueba tu cuenta en BienesRaices.com</p>
                
                <p>Tu cuenta esta lista, solo debes confirmala con el siguiente enlace:
                <a href="${confirmarUrl}">Confirmar Cuenta</a></p>

                <p>Si tu no creaste esta cuenta, puedes ignorar el mensaje</p>
            `
        });
    } catch (error) {
        console.log('Error al enviar email:', error);
    }
}

const emailOlvidePassword = async (datos) => {   
    const {email, nombre, token} = datos;
    
    // Construir la URL de recuperación
    const recuperarUrl = `${process.env.BACKEND_URL}/auth/olvide-password/${token}`;
    console.log('URL de recuperación:', recuperarUrl);
    
    try {
        await resend.emails.send({
            from: 'BienesRaices <onboarding@resend.dev>',
            to: email,
            subject: 'Reestablece tu Password en BienesRaices.com',
            html: `
                <p>Hola ${nombre}, has solicitado reestablecer tu password en BienesRaices.com</p>
                
                <p>Sigue el siguiente enlace para generar un password nuevo:
                <a href="${recuperarUrl}">Reestablecer Password</a></p>

                <p>Si tu no solicitaste el cambio de password, puedes ignorar el mensaje</p>
            `
        });
    } catch (error) {
        console.log('Error al enviar email:', error);
    }
}

export {
    emailRegistro,
    emailOlvidePassword
}