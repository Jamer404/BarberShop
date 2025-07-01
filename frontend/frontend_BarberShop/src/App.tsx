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
import { ToastContainer, toast } from 'react-toastify';


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
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/produtos" element={<Produtos />} />
        </Routes>
      </RootLayout>
    </Router>
    </>
  )
}