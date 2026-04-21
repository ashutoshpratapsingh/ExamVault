import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function Layout({children}){

  return (
    <>
      <Navbar/>

      <div className="layout">
        <Sidebar/>

        <div className="content">
          {children}
        </div>
      </div>
    </>
  );
}