export const registrationTmplate = `
<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LuxShop - Bienvenido!</title>
</head>

<body style="font-family: Arial, Helvetica, sans-serif;margin: 0;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f7f9fa;">
        <tbody>
            <tr>
                <td>&nbsp;</td>
                <td width="600">
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#fff">
                        <tbody>
                            <tr>
                                <td style="padding:24px;background-color:rgb(33, 32, 32);">
                                    <h1 style="color: white;">LuxShop</h1>                                   
                                </td>
                            </tr>
                            <tr>
                                <td style="padding:20px 10px;color: #231331;">
                                    <p style="max-width: 500px; margin-left: auto;margin-right: auto;"><b>Hola {{name}},</b></p>
                                    <p style="max-width: 500px; margin-left: auto;margin-right: auto;">¡Bienvenido a LuxShop! Nos complace tenerte como parte de nuestra comunidad.</p>
                                    <p style="max-width: 500px; margin-left: auto;margin-right: auto;">
                                        Tu cuenta ha sido creada con éxito. Ahora puedes explorar todas nuestras increíbles ofertas y productos.
                                    </p>
                                    <p style="margin-bottom: 30px;max-width: 500px; margin-left: auto;margin-right: auto;">
                                        Para comenzar a disfrutar de todos los beneficios, puedes hacer clic en el botón de abajo para ir a nuetra página y empezar a navegar.
                                    </p>

                                    <p style="max-width: 500px; margin-left: auto;margin-right: auto;"><button
                                            style="width: 191px;height: 35px;border-radius: 50rem;background-color: #231331; cursor: pointer;margin: 15px auto;"><a
                                                href="{{link}}" target="_blank" rel="noopener noreferer"
                                                style="text-decoration: none;color: white;border: none;">Ir a LuxShop</a>
                                        </button></p>


                                    <p style="max-width: 500px; margin-left: auto;margin-right: auto;">Si tienes alguna duda o necesitas ayuda, no dudes en contactarnos.</p>

                                    <p style="max-width: 500px; margin-left: auto;margin-right: auto;">
                                        Saludos, <br>
                                      <b>Equipo de LuxShop</b>  
                                    </p>
                                    <p style="margin-top: 50px; max-width: 500px;margin-left: auto;margin-right: auto;">
                                        <img src="https://tuculanding.vercel.app/img/Instagram_logo.png"
                                            style="width: 15px; margin-bottom: 0;" alt="Logo instagram"> @LuxShop
                                        <br>
                                        <img src="https://tuculanding.vercel.app/img/gmail_logo.png"
                                            style="width: 15px;" alt="Logo gmail"> lux.shop@gmail.com
                                    </p>
                                </td>
                            </tr>
                            <tr>
                                <td style="width: 100%; color: white; padding: 30px 0;background-color: #1f2937;"
                                    align="center">
                                    <p>LuxShop - Tu tienda de confianza para mantenerte siempre en la moda.</p>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </td>
                <td>&nbsp;</td>
            </tr>
        </tbody>
    </table>
</body>

</html>
`;
