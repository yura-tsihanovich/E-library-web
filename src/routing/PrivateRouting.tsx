import { Suspense } from "react";
import { Redirect, Switch } from "react-router-dom";
import { PrivateRoute } from "routing/components";
import { InternalLayer, AppLayer } from "core/layers";
import { Header, SideDrawer, Spinner } from "components/common";
import HomeRouting, { routes as homeRoutes } from "modules/Home/routing";
import UsersRouting, {
  routes as usersRoutes,
} from "modules/UserManagement/routing";
import FooterMobile from "../components/common/FooterMobile/FooterMobile";

const PrivateRouting: React.FC = () => (
  <AppLayer>
    <Suspense fallback={<Spinner />}>
      <SideDrawer />
      <Header />
      <Switch>
        <PrivateRoute path={usersRoutes.root} component={UsersRouting} />
        <PrivateRoute path={homeRoutes.root} component={HomeRouting} />

        <Redirect path="*" to={homeRoutes.root} />
      </Switch>
      <FooterMobile />
    </Suspense>
  </AppLayer>
);

const InternalRoutingLayer: React.FC = () => {
  return (
    <InternalLayer>
      <PrivateRouting />
    </InternalLayer>
  );
};

export default InternalRoutingLayer;
