import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Home from "@/features/home/pages/Home"
import RootLayout from "@/layout/Layout"
import Paises from "@/features/paises/Paises"
import Estados from "@/features/estados/Estados"
import Cidades from "@/features/cidades/Cidades"
import Funcionarios from "@/features/funcionarios/Funcionarios"
import FormasPagamento from "@/features/formaPagamento/FormaPagamento"
import CondicoesPagamento from "@/features/condicaoPagamento/CondicaoPagamento"
import Fornecedores from "@/features/fornecedores/Fornecedores"
import Clientes from "@/features/clientes/Clientes"
import Produtos from "@/features/produtos/Produtos"
import NotaCompraLista from "@/features/notaCompra/NotaCompraLista";
import Marcas from "@/features/marcas/Marcas"
import UnidadesMedidas from "./features/unidadesMedidas/UnidadesMedidas"
import Categorias from "./features/categorias/Categorias"
import Veiculos from "./features/veiculos/Veiculos"
import Transportadoras from "./features/transportadoras/Transportadoras"
import Cargos from "./features/cargos/Cargos"
import { ToastContainer } from 'react-toastify';


export default function App() {
  return (
    <>
    <ToastContainer position="bottom-right" autoClose={3000} aria-label="Notification container" />
    <Router>
      
      <RootLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/paises" element={<Paises />} />
          <Route path="/estados" element={<Estados />} />
          <Route path="/cidades" element={<Cidades />} />
          <Route path="/funcionarios" element={<Funcionarios />} />
          <Route path="/formas-pagamento" element={<FormasPagamento />} />
          <Route path="/condicoes-pagamento" element={<CondicoesPagamento />} />
          <Route path="/fornecedores" element={<Fornecedores />} />
          <Route path="/marcas" element={<Marcas />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/produtos" element={<Produtos />} />
          <Route path="/nota-compra" element={<NotaCompraLista />} />
          <Route path="/unidades-medida" element={<UnidadesMedidas />} />
          <Route path="/categorias" element={<Categorias />} />
          <Route path="/veiculos" element={<Veiculos />} />
          <Route path="/transportadoras" element={<Transportadoras />} />
          <Route path="/cargos" element={<Cargos />} />
        </Routes>
      </RootLayout>
    </Router>
    </>
  )
}