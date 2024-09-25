import './style.scss'
import { Link, useParams } from 'react-router-dom'
import Logo from '../../../assets/GrupoperaltasCompleto.png'
import { ExpandMore, KeyboardArrowDown, Launch, Menu, SmsFailed, SmsFailedOutlined } from '@mui/icons-material'
import { Accordion, AccordionDetails, AccordionSummary, Divider } from '@mui/material'

const BudgetClientPage = () => {

    const { id, token } = useParams()
    return (
        <div className='client-budget'>
            <header>
                <div className="content">
                    <img src={Logo} alt="Logo Grupo Peralta" />
                    <span className="btnMenu">
                        <Menu />
                    </span>
                </div>
            </header>


            <main>
                <div className="content">
                    <div className='info'>
                        <h1>O que aproveitará em nosso HOTEL:</h1>
                        <div className="cards">
                            <Accordion className="card">

                                <AccordionSummary
                                    expandIcon={<ExpandMore />}
                                >ALIMENTAÇÃO</AccordionSummary>
                                <AccordionDetails>PENSÃO COMPLETA: Café da manhã, almoço e jantar + suco natural do dia e sobremesa (outras
                                    bebidas e consumos cobrados à parte). Contamos com refeições temáticas com pratos ecléticos e
                                    feitos com ingredientes naturais da fazenda.IMPORTANTE: Trabalhamos com regime de pensão
                                    completa no sistema "Buffet Self
                                    Service" à vontade acima de 21 apartamentos. Quando há um fuxo menor de
                                    hóspedes, servimos o sistema "À La Carte" com a opção também à vontade.</AccordionDetails>
                            </Accordion>
                            <Accordion className="card">

                                <AccordionSummary
                                    expandIcon={<ExpandMore />}
                                >RELAX</AccordionSummary>
                                <AccordionDetails>Aproveite gazebos para leitura, bosque com redário, sauna seca e a Lagoa Encantada:
                                    uma piscina temática, aquecida e coberta com variação de temperatura entre 28º a 30ºC.
                                    Ambientalizada em uma caverna cenográfca, possuindo iluminação cênica computadorizada,
                                    som digital, cachoeiras, jatos de água,
                                    estruturas de pontos de jacuzzi, disponível:
                                    Terça a Domingo: das 10h às 13h e das 15h às 18h45</AccordionDetails>
                            </Accordion>
                            <Accordion className="card">

                                <AccordionSummary
                                    expandIcon={<ExpandMore />}
                                >PROGRAMAÇÃO do HOTEL</AccordionSummary>
                                <AccordionDetails>Contamos com uma equipe de lazer especializada para adultos e crianças a partir de 04 anos.
                                    Atividades desde o café da manhã até o jantar, como ofcinas de artes e culinária, desafos
                                    aquáticos, passeios ecológicos internos, ordenha, futebol de sabão, arco e fecha, mini circuito de
                                    arvorismo, campeonatos de futebol e volei, paredão de escalada, touro mecânico, tirolesa no lago,
                                    gincanas em família e muito mais!</AccordionDetails>
                            </Accordion>
                            <Accordion className="card">

                                <AccordionSummary
                                    expandIcon={<ExpandMore />}
                                >PETFRIENDLY</AccordionSummary>
                                <AccordionDetails>PETS pequenos, médios e de grande porte de raças dóceis são muito bem-vindos em nosso hotel
                                    fazenda, porém como nossa política é satisfazer a todos, informamos que a ala luxo (800) é a única
                                    do nosso hotel que não recebe animais de estimação. É obrigatório o envio da carteira de
                                    vacinação do PET e regulamento animal assinado. Orientamos a passear com o seu melhor amigo
                                    munido de guia e em áreas abertas que não interfram em piscinas e restaurantes. Contamos com o
                                    DOG PARK - local dedicado a acondicionar o pet em canis individuais na ausência do tutor e um
                                    circuito de agility, ideal para se exercitarem.É de suma importância comunicar com antecedência
                                    que trará seu animal de estimação, visto que os mesmos só poderão ser acomodados nas alas
                                    PADRÃO VARANDA e sob aviso prévio.</AccordionDetails>
                            </Accordion>
                            <Accordion className="card">

                                <AccordionSummary
                                    expandIcon={<ExpandMore />}
                                >OBSERVAÇÃO DOS ASTROS</AccordionSummary>
                                <AccordionDetails>Faça a sua reserva antecipadamente e ganhe 20% de desconto nos ingressos integrais
                                    para o Centro de Estudos do Universo, que fca dentro de nosso complexo! Nesse local
                                    poderá realizar observação de astros em telescópios profssionais e sessão de
                                    planetário com conteúdo exclusivo! www.ceubrotas.com.br
                                    Consulte se há sessão aberta e disponivel na data de sua estada</AccordionDetails>
                            </Accordion>
                            <Accordion className="card">

                                <AccordionSummary
                                    expandIcon={<ExpandMore />}
                                >RADICAL</AccordionSummary>
                                <AccordionDetails>Aproveite a sua vinda a Brotas para realizar as melhores atividades ecológicas e radicais do país!
                                    Temos parceria com as principais operadoras certifcadas da cidade para que conheçam Rafting e
                                    Tirolesas com translado gratuito!</AccordionDetails>
                            </Accordion>
                            <Accordion className="card">
                                <a
                                    href='https://grupoperaltas.pixieset.com/brotasecohotelfazenda/'
                                    target='_blank'
                                    style={{ textDecoration: 'none', color: 'black' }}
                                >
                                <AccordionSummary
                                    expandIcon={<Launch />}
                                    style={{ pointerEvents: 'none' }}
                                >FOTOS DO HOTEL</AccordionSummary>
                                </a>
                                </Accordion>
                        </div>
                    </div>
                    <div className="cards">
                        <div className="card">
                            <div className='top'>
                                <img src='/room/800-2.jpeg' alt="quarto" />
                                <div className="top-content">
                                    <div className="cover-stars"> ★ ★ ★ ★ ★ </div>
                                    <h3>Luxo - 1 noite</h3>
                                </div>
                            </div>
                            <div className="middle">
                                <div className='box-info'>
                                    <h3>Check-in</h3>
                                    <p>Ter, 24 set - 16h</p>
                                </div>
                                <Divider orientation='vertical' />
                                <div className='box-info'>
                                    <h3>Check-out</h3>
                                    <p>Qua, 25 set - 15h</p>
                                </div>
                                <Divider orientation='vertical' />
                                <div className='box-info'>
                                    <h3>Disposição</h3>
                                    <p>2 hos, 1 Chd</p>
                                </div>
                            </div>
                            <Divider />
                            <div className="bottom">
                                <div className="left">
                                    <p>Melhor Tarifa disponível!</p>

                                    <div className="list">
                                        <p className="included"><span className="dot">⬤</span>Diaria Cortezia</p>
                                        <p className="included"><span className="dot">⬤</span>Pet Grande</p>
                                    </div>
                                </div>
                                <div className="right">
                                    <div className="price">
                                        <p>R$ 1.650,00</p>
                                        <h3>R$ 1.500,00</h3>
                                    </div>
                                </div>
                            </div>
                            <Divider />
                            <div className="footer">
                                <p>Pague em até 10x </p>
                                <SmsFailedOutlined />
                            </div>
                        </div>
                        <div className="card">
                            <div className='top'>
                                <img src='/room/800-2.jpeg' alt="quarto" />
                                <div className="top-content">
                                    <div className="cover-stars"> ★ ★ ★ ★ ★ </div>
                                    <h3>Luxo - 1 noite</h3>
                                </div>
                            </div>
                            <div className="middle">
                                <div className='box-info'>
                                    <h3>Check-in</h3>
                                    <p>Ter, 24 set - 16h</p>
                                </div>
                                <Divider orientation='vertical' />
                                <div className='box-info'>
                                    <h3>Check-out</h3>
                                    <p>Qua, 25 set - 15h</p>
                                </div>
                                <Divider orientation='vertical' />
                                <div className='box-info'>
                                    <h3>Disposição</h3>
                                    <p>2 hos, 1 Chd</p>
                                </div>
                            </div>
                            <Divider />
                            <div className="bottom">
                                <div className="left">
                                    <p>Melhor Tarifa disponível!</p>

                                    <div className="list">
                                        <p className="included"><span className="dot">⬤</span>Diaria Cortezia</p>
                                        <p className="included"><span className="dot">⬤</span>Pet Grande</p>
                                    </div>
                                </div>
                                <div className="right">
                                    <div className="price">
                                        <p>R$ 1.650,00</p>
                                        <h3>R$ 1.500,00</h3>
                                    </div>
                                </div>
                            </div>
                            <Divider />
                            <div className="footer">
                                <p>Pague em até 10x </p>
                                <SmsFailedOutlined />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default BudgetClientPage