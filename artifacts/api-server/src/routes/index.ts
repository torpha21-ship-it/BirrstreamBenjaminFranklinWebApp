import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import dashboardRouter from "./dashboard";
import packagesRouter from "./packages";
import tasksRouter from "./tasks";
import depositsRouter from "./deposits";
import withdrawalsRouter from "./withdrawals";
import referralsRouter from "./referrals";
import transactionsRouter from "./transactions";
import userRouter from "./user";
import yieldsRouter from "./yields";
import adminRouter from "./admin";
import adminUsersRouter from "./admin-users";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(dashboardRouter);
router.use(packagesRouter);
router.use(tasksRouter);
router.use(depositsRouter);
router.use(withdrawalsRouter);
router.use(referralsRouter);
router.use(transactionsRouter);
router.use(userRouter);
router.use(yieldsRouter);
router.use(adminRouter);
router.use(adminUsersRouter);

export default router;
