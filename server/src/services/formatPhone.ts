const formatPhone = (phone: string) => {
    if(!phone) return '';
    // retira tudo que não for numero
    phone = phone.replace(/\D/g, '');

    // verificar se tem 55
    if (phone.slice(0, 2) !== "55") {
        // Adiciona "55"
        phone = "55" + phone;
    }

    return phone;
}

export default formatPhone