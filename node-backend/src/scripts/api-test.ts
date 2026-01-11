
import axios from 'axios';
import type { AxiosInstance, AxiosResponse } from 'axios';
import dotenv from 'dotenv';
import { randomBytes } from 'crypto';

dotenv.config();

const API_URL = process.env.API_TEST_URL || 'http://localhost:5000/api/v1';

// Full Theme Constant for Chatbot Tests
const FULL_THEME_COLORS = {
    bg_color: "#ffffff", ai_bubble_color: "#f0f0f0", user_bubble_color: "#007bff",
    accent_color: "#007bff", text_field_color: "#ffffff", text_field_foreground: "#000000",
    text_field_icon_color: "#000000", footer_bg_color: "#ffffff", header_color: "#ffffff",
    header_text_color: "#000000", ai_bubble_text_color: "#000000", user_bubble_text_color: "#ffffff",
    ai_bubble_border_color: "#e0e0e0", user_bubble_border_color: "#007bff", user_profile_bg_color: "#007bff",
    ai_profile_bg_color: "#e0e0e0", header_separator_color: "#e0e0e0", header_icon_color: "#000000",
    send_btn_color: "#007bff", send_btn_icon_color: "#ffffff", input_placeholder_color: "#999999",
    timestamp_color: "#999999", search_highlight_color: "#ffff00", loading_indicator_color: "#007bff",
    footer_text_color: "#000000", success_color: "#28a745", header_logo_border_color: "#e0e0e0",
    header_logo_bg_color: "#ffffff"
};

interface TestDetail {
    status: 'PASS' | 'FAIL';
    description: string;
    technicalDetails: string;
}

interface UserContext {
    token: string;
    id: string;
    email: string;
    password: string;
    refreshToken?: string;
}

interface Resources {
    planId?: string;
    subAId?: string;
    llmIdA?: string;
    docId?: string;
    botId?: string;
    convId?: string;
}

class ApiTester {
    client: AxiosInstance;
    resources: Resources = {};
    context: {
        admin: UserContext;
        userA: UserContext;
        userB: UserContext;
        quotaUser: UserContext;
    } = {
        admin: { token: '', id: '', email: '', password: '' },
        userA: { token: '', id: '', email: '', password: '' },
        userB: { token: '', id: '', email: '', password: '' },
        quotaUser: { token: '', id: '', email: '', password: '' }
    };
    stats = { passed: 0, failed: 0, total: 0 };
    testDetails: TestDetail[] = [];

    constructor() {
        this.client = axios.create({
            baseURL: API_URL,
            validateStatus: () => true, // Handle all status codes manually
        });

        // Generate random emails
        const rand = randomBytes(4).toString('hex');
        this.context.admin.email = `admin_${rand}@test.com`;
        this.context.admin.password = 'AdminPass123!';
        this.context.userA.email = `userA_${rand}@test.com`;
        this.context.userA.password = 'UserPass123!';
        this.context.userB.email = `userB_${rand}@test.com`;
        this.context.userB.password = 'UserPass123!';
        this.context.quotaUser.email = `quota_${rand}@test.com`;
        this.context.quotaUser.password = 'QuotaPass123!';

        console.log(`Test Suite Started at ${new Date().toISOString()}`);
        console.log(`API URL: ${API_URL}`);
    }

    private log(msg: string) {
        console.log(msg);
    }
    private section(title: string) {
        const line = `\n═══════════════════════════════════════════════════════════════\n  ${title}\n═══════════════════════════════════════════════════════════════\n`;
        console.log(line);
    }

    // Core Request Method
    private async req(method: 'get' | 'post' | 'put' | 'patch' | 'delete', url: string, data?: unknown, token?: string, description?: string): Promise<AxiosResponse> {
        if (description) {
            console.log(`\n[TEST] ${description}`);
        }

        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        console.log(`REQ: ${method.toUpperCase()} ${url}`);

        if (data) {
            console.log(`PAYLOAD: ${JSON.stringify(data, null, 2)}`);
        }

        if (token) {
            console.log(`TOKEN: ${token.substring(0, 20)}...`);
        }

        try {
            const res = await this.client.request({ method, url, data, headers });

            console.log(`RES: ${res.status} ${res.statusText}`);

            if (res.data) {
                console.log(`DATA: ${JSON.stringify(res.data, null, 2)}`);
            }

            return res;
        } catch (err: unknown) {
            const error = err as Error;
            console.error(`NET ERROR: ${error.message}`);
            throw err;
        }
    }

    // Assertion Helpers
    private pass(msg: string, technicalDetails?: string) {
        this.stats.passed++;
        this.stats.total++;
        console.log(`✓ PASS: ${msg}`);

        if (technicalDetails) {
            this.testDetails.push({ status: 'PASS', description: msg, technicalDetails });
        }
    }

    private fail(msg: string, details?: unknown, technicalDetails?: string) {
        this.stats.failed++;
        this.stats.total++;
        console.log(`✗ FAIL: ${msg}`);

        if (details) {
            console.log(`  DETAILS: ${JSON.stringify(details, null, 2)}`);
        }

        if (technicalDetails) {
            this.testDetails.push({ status: 'FAIL', description: msg, technicalDetails });
        }
    }

    private expect(res: AxiosResponse, status: number, msg: string) {
        if (res.status === status) this.pass(msg);
        else this.fail(msg, { expected: status, got: res.status, data: res.data });
    }

    private expectSuccess(res: AxiosResponse, msg: string) {
        if (res.status >= 200 && res.status < 300) this.pass(msg);
        else this.fail(msg, { status: res.status, data: res.data });
    }

    private expectFailure(res: AxiosResponse, msg: string) {
        if (res.status >= 400) this.pass(msg);
        else this.fail(msg, { status: res.status, data: res.data });
    }

    // Phase 1: Authentication & Identity
    async phase1_Auth() {
        this.section("PHASE 1: Authentication & Identity");

        // Register Users
        const resA = await this.req('post', '/auth/register', { firstName: "User", lastName: "A", email: this.context.userA.email, password: this.context.userA.password }, undefined, "Register User A");
        if (resA.status === 201) {
            this.pass("User A Registered", "POST /auth/register with {firstName, lastName, email, password} → Extract user._id from response.data.user._id");
            if (resA.data?.data?.user?._id) this.context.userA.id = resA.data.data.user._id;
        } else {
            this.fail("User A Registered", { expected: 201, got: resA.status, data: resA.data });
        }

        const resB = await this.req('post', '/auth/register', { firstName: "User", lastName: "B", email: this.context.userB.email, password: this.context.userB.password }, undefined, "Register User B");
        this.expect(resB, 201, "User B Registered");
        if (resB.data?.data?.user?._id) this.context.userB.id = resB.data.data.user._id;

        const resAdmin = await this.req('post', '/auth/register', { firstName: "Admin", lastName: "User", email: this.context.admin.email, password: this.context.admin.password }, undefined, "Register Admin");
        this.expect(resAdmin, 201, "Admin Registered");
        if (resAdmin.data?.data?.user?._id) this.context.admin.id = resAdmin.data.data.user._id;

        const resQuota = await this.req('post', '/auth/register', { firstName: "Quota", lastName: "User", email: this.context.quotaUser.email, password: this.context.quotaUser.password }, undefined, "Register Quota User");
        this.expect(resQuota, 201, "Quota User Registered");
        if (resQuota.data?.data?.user?._id) this.context.quotaUser.id = resQuota.data.data.user._id;

        // Duplicate Register
        await this.req('post', '/auth/register', { firstName: "Copy", lastName: "Cat", email: this.context.userA.email, password: "Password123!" }, undefined, "Register Duplicate Email").then(r => {
             if (r.status === 400 || r.status === 409) this.pass("Duplicate Email Blocked", "POST /auth/register with existing email → Expect 400/409 error");
             else this.fail("Duplicate Email Allowed", r.status, "POST /auth/register with duplicate email should return error");
        });

        // Invalid Register
        await this.req('post', '/auth/register', { firstName: "Bad", lastName: "Guy", email: "not-an-email", password: "123" }, undefined, "Register Invalid Data").then(r => {
            this.expectFailure(r, "Invalid Data Blocked");
        });

        // Promote Admin
        const { execSync } = await import('child_process');
        try {
            console.log("Promoting admin...");
            execSync(`npm run make-admin -- ${this.context.admin.email}`, { stdio: 'ignore' });
            this.pass("Admin Promotion Script Ran");
        } catch {
            this.fail("Admin Promotion Script Failed");
        }

        // Login Users
        const loginA = await this.req('post', '/auth/login', { email: this.context.userA.email, password: this.context.userA.password }, undefined, "Login User A");
        if (loginA.status === 200) {
            this.pass("User A Logged In", "POST /auth/login with {email, password} → Extract accessToken and refreshToken from response.data.tokens");
            this.context.userA.token = loginA.data?.data?.tokens?.access?.token || loginA.data?.data?.accessToken || loginA.data?.accessToken;
            this.context.userA.refreshToken = loginA.data?.data?.tokens?.refresh?.token || loginA.data?.data?.refreshToken || loginA.data?.refreshToken;

            if (!this.context.userA.token) {
                console.error("CRITICAL: User A Token missing. EXITING.");
                process.exit(1);
            }
        } else {
            this.fail("User A Logged In", { expected: 200, got: loginA.status, data: loginA.data });
            process.exit(1);
        }

        const loginB = await this.req('post', '/auth/login', { email: this.context.userB.email, password: this.context.userB.password }, undefined, "Login User B");
        this.expect(loginB, 200, "User B Logged In");
        this.context.userB.token = loginB.data?.data?.tokens?.access?.token || loginB.data?.data?.accessToken || loginB.data?.accessToken;
        if (!this.context.userB.token) this.fail("CRITICAL: User B Token missing from response");

        const loginAdmin = await this.req('post', '/auth/login', { email: this.context.admin.email, password: this.context.admin.password }, undefined, "Login Admin");
        this.expect(loginAdmin, 200, "Admin Logged In");
        this.context.admin.token = loginAdmin.data?.data?.tokens?.access?.token || loginAdmin.data?.data?.accessToken || loginAdmin.data?.accessToken;
        this.context.admin.refreshToken = loginAdmin.data?.data?.tokens?.refresh?.token || loginAdmin.data?.data?.refreshToken || loginAdmin.data?.refreshToken;
        if (!this.context.admin.token) this.fail("CRITICAL: Admin Token missing from response");

        const loginQuota = await this.req('post', '/auth/login', { email: this.context.quotaUser.email, password: this.context.quotaUser.password }, undefined, "Login Quota User");
        this.expect(loginQuota, 200, "Quota User Logged In");
        this.context.quotaUser.token = loginQuota.data?.data?.tokens?.access?.token || loginQuota.data?.data?.accessToken || loginQuota.data?.accessToken;

        // Login Invalid
        await this.req('post', '/auth/login', { email: this.context.userA.email, password: "wrong_password" }, undefined, "Login Invalid Password").then(r => {
            this.expectFailure(r, "Invalid Login Blocked");
        });

        // Profile
        const profile = await this.req('get', '/auth/me', null, this.context.userA.token, "Get Profile User A");
        this.expect(profile, 200, "Got Profile");

        // Update Profile
        const updateP = await this.req('put', '/auth/profile', { firstName: "User A", lastName: "Updated" }, this.context.userA.token, "Update Profile");
        this.expect(updateP, 200, "Profile Updated");

        // Refresh Token
        if (this.context.userA.refreshToken) {
            const refRes = await this.req('post', '/auth/refresh', { refreshToken: this.context.userA.refreshToken }, undefined, "Refresh Token");
            this.expectSuccess(refRes, "Token Refreshed");
            if (refRes.data?.data?.tokens?.access?.token || refRes.data?.data?.accessToken) {
                this.context.userA.token = refRes.data?.data?.tokens?.access?.token || refRes.data?.data?.accessToken;
            }
        } else {
            this.log("WARN: No refresh token in login response");
        }

        // Invalid Refresh Token
        await this.req('post', '/auth/refresh', { refreshToken: "invalid_token_here" }, undefined, "Refresh with Invalid Token").then(r => {
            this.expectFailure(r, "Invalid Refresh Token Blocked");
        });
    }

    // Phase 2: Public Endpoints
    async phase2_Public() {
        this.section("PHASE 2: Public & Common");

        const plans = await this.req('get', '/plans/public', null, undefined, "Get Public Plans");
        this.expectSuccess(plans, "Public Plans Retrieved");

        const contact = await this.req('post', '/contact-us', { email: "visitor@test.com", subject: "Hi", body: "Hello" }, undefined, "Submit Contact Us");
        this.expect(contact, 201, "Contact Submitted");

        const contactBad = await this.req('post', '/contact-us', { email: "bad-email", subject: "Hi", body: "Hello" }, undefined, "Submit Bad Contact");
        this.expectFailure(contactBad, "Bad Contact Blocked");
    }

    // Phase 3: Admin Role Management
    async phase3_Roles() {
        this.section("PHASE 3: Admin Role Management");

        // List Permissions
        const perms = await this.req('get', '/admin/roles/permissions', null, this.context.admin.token, "List Permissions");
        this.expectSuccess(perms, "Permissions Listed");
        const permId = perms.data?.data?.[0]?._id;

        // List Roles
        const roles = await this.req('get', '/admin/roles', null, this.context.admin.token, "List Roles");
        this.expectSuccess(roles, "Roles Listed");

        // Create Role
        const newRole = await this.req('post', '/admin/roles', { name: `TestRole_${Date.now()}`, description: "Test Role", permissionIds: permId ? [permId] : [] }, this.context.admin.token, "Create Role");
        this.expectSuccess(newRole, "Role Created");
        const roleId = newRole.data?.data?._id;

        if (roleId) {
            // Get Role By ID
            const getRole = await this.req('get', `/admin/roles/${roleId}`, null, this.context.admin.token, "Get Role By ID");
            this.expectSuccess(getRole, "Role Retrieved");

            // Update Role
            const updateRole = await this.req('put', `/admin/roles/${roleId}`, { description: "Updated Description" }, this.context.admin.token, "Update Role");
            this.expectSuccess(updateRole, "Role Updated");

            // Delete Role
            const delRole = await this.req('delete', `/admin/roles/${roleId}`, null, this.context.admin.token, "Delete Role");
            this.expectSuccess(delRole, "Role Deleted");
        }

        // SECURITY: User cannot access role APIs
        await this.req('get', '/admin/roles', null, this.context.userA.token, "User A Tries List Roles (Negative)").then(r => {
            this.expectFailure(r, "User Cannot Access Roles API");
        });

        await this.req('post', '/admin/roles', { name: "HackRole" }, this.context.userA.token, "User A Tries Create Role (Negative)").then(r => {
            this.expectFailure(r, "User Cannot Create Role");
        });
    }

    // Phase 4: Admin User Management
    async phase4_Users() {
        this.section("PHASE 4: Admin User Management");

        // List Users
        const users = await this.req('get', '/admin/users?limit=5', null, this.context.admin.token, "List Users");
        this.expectSuccess(users, "Users Listed");
        const userId = users.data?.data?.data?.[0]?._id;

        if (userId) {
            // Get User By ID
            const getUser = await this.req('get', `/admin/users/${userId}`, null, this.context.admin.token, "Get User By ID");
            this.expectSuccess(getUser, "User Retrieved");
        }

        // Get roles for assignment
        const rolesRes = await this.req('get', '/admin/roles', null, this.context.admin.token, "Get Roles for Assignment");
        const roleId = rolesRes.data?.data?.data?.[0]?._id;

        if (roleId && this.context.userB.id) {
            // Assign Role to User B
            const assignRole = await this.req('put', `/admin/users/${this.context.userB.id}/roles`, { roleIds: [roleId] }, this.context.admin.token, "Assign Role to User B");
            this.expectSuccess(assignRole, "Role Assigned to User");
        }

        // Create User via Admin
        const newUser = await this.req('post', '/admin/users', { email: `created_by_admin_${Date.now()}@test.com`, password: this.context.userA.password, firstName: "Created", lastName: "ByAdmin" }, this.context.admin.token, "Admin Creates User");
        this.expectSuccess(newUser, "Admin Created User");

        // SECURITY: User cannot access admin user APIs
        await this.req('get', '/admin/users', null, this.context.userA.token, "User A Tries List Users (Negative)").then(r => {
            this.expectFailure(r, "User Cannot List Users");
        });

        await this.req('post', '/admin/users', { email: "hack@test.com", password: "Test123!" }, this.context.userA.token, "User A Tries Create User (Negative)").then(r => {
            this.expectFailure(r, "User Cannot Create User via Admin API");
        });
    }

    // Phase 5: Plans & Subscriptions
    async phase5_Plans() {
        this.section("PHASE 5: Plans & Subscriptions");

        // Create Plan
        const planData = {
            name: `ProPlan_${Date.now()}`,
            description: "Best for pros",
            price: 2999,
            duration: 30,
            benefits: ["basic_chat", "advanced_models"],
            max_chatbot_count: 5,
            max_chatbot_shares: 5,
            max_document_count: 10,
            max_word_count_per_document: 100000,
            is_public_chatbot_allowed: true,
            is_active: true
        };

        const planRes = await this.req('post', '/admin/plans', planData, this.context.admin.token, "Admin Create Plan");
        if (planRes.status >= 200 && planRes.status < 300) {
            this.pass("Plan Created", "POST /admin/plans with admin token → Create plan with quota limits → Extract plan._id");
        } else {
            this.fail("Plan Created", { status: planRes.status, data: planRes.data });
        }

        if (planRes.data?.data?.plan?._id) {
            const planId = planRes.data.data.plan._id;
            this.resources.planId = planId;

            // Get Plan By ID
            const getPlan = await this.req('get', `/admin/plans/${planId}`, null, this.context.admin.token, "Get Plan By ID");
            this.expectSuccess(getPlan, "Plan Retrieved");

            // Update Plan
            const updatePlan = await this.req('put', `/admin/plans/${planId}`, { price: 3999, benefits: ["basic_chat", "advanced_models"] }, this.context.admin.token, "Update Plan");
            this.expectSuccess(updatePlan, "Plan Updated");

            // List Plans
            const listPlans = await this.req('get', '/admin/plans', null, this.context.admin.token, "List Plans");
            this.expectSuccess(listPlans, "Plans Listed");

            // Subscribe User A
            const subA = await this.req('post', '/admin/subscriptions', {
                user_id: this.context.userA.id,
                plan_id: planId,
                start_date: new Date(),
                end_date: new Date(Date.now() + 30*24*60*60*1000),
                status: 'active',
                payment_status: 'paid'
            }, this.context.admin.token, "Subscribe User A");
            this.expectSuccess(subA, "User A Subscribed");
            if (subA.data?.data?._id) this.resources.subAId = subA.data.data._id;

            // Subscribe User B
            const subB = await this.req('post', '/admin/subscriptions', {
                user_id: this.context.userB.id,
                plan_id: planId,
                start_date: new Date(),
                end_date: new Date(Date.now() + 30*24*60*60*1000),
                status: 'active',
                payment_status: 'paid'
            }, this.context.admin.token, "Subscribe User B");
            this.expectSuccess(subB, "User B Subscribed");

            // Subscribe Admin
            const subAdmin = await this.req('post', '/admin/subscriptions', {
                user_id: this.context.admin.id,
                plan_id: planId,
                start_date: new Date(),
                end_date: new Date(Date.now() + 30*24*60*60*1000),
                status: 'active',
                payment_status: 'paid'
            }, this.context.admin.token, "Subscribe Admin");
            this.expectSuccess(subAdmin, "Admin Subscribed");

            // Get User Subscriptions
            const getSubs = await this.req('get', `/admin/subscriptions/user/${this.context.userA.id}`, null, this.context.admin.token, "Get User A Subscriptions");
            this.expectSuccess(getSubs, "User Subscriptions Retrieved");

            // Duplicate Subscription (Should Fail)
            await this.req('post', '/admin/subscriptions', {
                user_id: this.context.userA.id,
                plan_id: planId,
                start_date: new Date(),
                end_date: new Date(Date.now() + 30*24*60*60*1000),
                status: 'active',
                payment_status: 'paid'
            }, this.context.admin.token, "Create Duplicate Subscription (Negative)").then(r => {
                this.expectFailure(r, "Duplicate Subscription Prevented");
            });

            // Cancel Subscription
            if (this.resources.subAId) {
                const cancelSub = await this.req('delete', `/admin/subscriptions/${this.resources.subAId}`, null, this.context.admin.token, "Cancel Subscription");
                this.expectSuccess(cancelSub, "Subscription Cancelled");

                // Re-subscribe for subsequent tests
                const resubA = await this.req('post', '/admin/subscriptions', {
                    user_id: this.context.userA.id,
                    plan_id: planId,
                    start_date: new Date(),
                    end_date: new Date(Date.now() + 30*24*60*60*1000),
                    status: 'active',
                    payment_status: 'paid'
                }, this.context.admin.token, "Re-subscribe User A");
                this.expectSuccess(resubA, "User A Re-subscribed");
            }

            // SECURITY: User cannot manage plans
            await this.req('post', '/admin/plans', { name: "HackPlan" }, this.context.userA.token, "User A Tries Create Plan (Negative)").then(r => {
                this.expectFailure(r, "User Cannot Create Plan");
            });

            await this.req('delete', `/admin/plans/${planId}`, this.context.userA.token, "User A Tries Delete Plan (Negative)").then(r => {
                this.expectFailure(r, "User Cannot Delete Plan");
            });

            // SECURITY: User cannot manage subscriptions
            await this.req('post', '/admin/subscriptions', {
                user_id: this.context.userA.id,
                plan_id: planId
            }, this.context.userA.token, "User A Tries Create Subscription (Negative)").then(r => {
                this.expectFailure(r, "User Cannot Create Subscription");
            });
        } else {
            this.fail("Skipping Subscriptions: Plan creation failed or invalid response");
        }
    }

    // Phase 6: Admin Stats & Contact Us
    async phase6_AdminOps() {
        this.section("PHASE 6: Admin Stats & Contact Us Management");

        // Get Admin Stats
        const startDate = new Date(Date.now() - 30*24*60*60*1000).toISOString();
        const endDate = new Date().toISOString();
        const stats = await this.req('get', `/admin/stats?startDate=${startDate}&endDate=${endDate}`, null, this.context.admin.token, "Get Admin Stats");
        this.expectSuccess(stats, "Admin Stats Retrieved");

        // SECURITY: User cannot access admin stats
        await this.req('get', '/admin/stats', null, this.context.userA.token, "User A Tries Admin Stats (Negative)").then(r => {
            this.expectFailure(r, "User Cannot Access Admin Stats");
        });

        // Admin List Contact Submissions
        const contacts = await this.req('get', '/admin/contact-us', null, this.context.admin.token, "Admin List Contact Submissions");
        this.expectSuccess(contacts, "Contact Submissions Listed");
        const contactId = contacts.data?.data?.data?.[0]?._id;

        if (contactId) {
            // Admin Get Contact By ID
            const getContact = await this.req('get', `/admin/contact-us/${contactId}`, null, this.context.admin.token, "Admin Get Contact By ID");
            this.expectSuccess(getContact, "Contact Retrieved");

            // Admin Update Contact Status
            const updateContact = await this.req('patch', `/admin/contact-us/${contactId}/status`, { status: "resolved" }, this.context.admin.token, "Admin Update Contact Status");
            this.expectSuccess(updateContact, "Contact Status Updated");
        }

        // SECURITY: User cannot access Contact Us Admin APIs
        await this.req('get', '/admin/contact-us', null, this.context.userA.token, "User A Tries List Contacts (Negative)").then(r => {
            this.expectFailure(r, "User Cannot List Contacts");
        });
    }

    // Phase 7: LLM Configurations
    async phase7_LLMConfigs() {
        this.section("PHASE 7: LLM Configuration Management");

        // User A Creates LLM Config
        const createLLM = await this.req('post', '/llmconfigs', { model_name: "gpt-4", provider: "OPENAI", api_key: "sk-test123456789" }, this.context.userA.token, "User A Creates LLM Config");
        this.expectSuccess(createLLM, "User A Created LLM Config");
        const llmIdA = createLLM.data?.data?.llmConfig?._id;

        if (llmIdA) {
            this.resources.llmIdA = llmIdA;

            // List LLM Configs
            const listLLM = await this.req('get', '/llmconfigs', null, this.context.userA.token, "User A Lists LLM Configs");
            this.expectSuccess(listLLM, "LLM Configs Listed");

            // Get LLM Config By ID
            const getLLM = await this.req('get', `/llmconfigs/${llmIdA}`, null, this.context.userA.token, "User A Gets LLM Config");
            this.expectSuccess(getLLM, "LLM Config Retrieved");

            // Update LLM Config
            const updateLLM = await this.req('put', `/llmconfigs/${llmIdA}`, { model_name: "gpt-4-turbo" }, this.context.userA.token, "User A Updates LLM Config");
            this.expectSuccess(updateLLM, "LLM Config Updated");

            // SECURITY: User B cannot access User A's LLM Config
            await this.req('get', `/llmconfigs/${llmIdA}`, null, this.context.userB.token, "User B Tries Access User A's LLM Config (Negative)").then(r => {
                this.expectFailure(r, "User B Cannot Access User A's LLM Config");
            });

            await this.req('put', `/llmconfigs/${llmIdA}`, { model_name: "hacked" }, this.context.userB.token, "User B Tries Update User A's LLM Config (Negative)").then(r => {
                this.expectFailure(r, "User B Cannot Update User A's LLM Config");
            });

            await this.req('delete', `/llmconfigs/${llmIdA}`, null, this.context.userB.token, "User B Tries Delete User A's LLM Config (Negative)").then(r => {
                this.expectFailure(r, "User B Cannot Delete User A's LLM Config");
            });

            // Delete LLM Config
            const deleteLLM = await this.req('delete', `/llmconfigs/${llmIdA}`, null, this.context.userA.token, "User A Deletes LLM Config");
            this.expectSuccess(deleteLLM, "LLM Config Deleted");
        }

        // User A Creates OLLAMA Config
        const createOllama = await this.req('post', '/llmconfigs', {
             model_name: "gemma3:270m",
             provider: "OLLAMA",
             base_url: "http://localhost:11434"
        }, this.context.userA.token, "User A Creates OLLAMA Config");
        this.expectSuccess(createOllama, "User A Created OLLAMA Config");
        
        const ollamaId = createOllama.data?.data?.llmConfig?._id;
        if (ollamaId) {
             // Verify base_url is saved
             const getOllama = await this.req('get', `/llmconfigs/${ollamaId}`, null, this.context.userA.token, "User A Gets OLLAMA Config");
             this.expectSuccess(getOllama, "OLLAMA Config Retrieved");
             if (getOllama.data?.data?.base_url === "http://localhost:11434") {
                 this.pass("OLLAMA Base URL Verified");
             } else {
                 this.fail("OLLAMA Base URL Mismatch", { expected: "http://localhost:11434", got: getOllama.data?.data?.base_url });
             }

             // Cleanup OLLAMA config
             await this.req('delete', `/llmconfigs/${ollamaId}`, null, this.context.userA.token, "User A Deletes OLLAMA Config");
        }
    }

    // Phase 8: Documents & Isolation
    async phase8_Documents() {
        this.section("PHASE 8: Documents & Isolation");

        // Create Doc
        const docPayload = {
            name: "Secret Doc",
            description: "Confidential",
            chunks: [{
                id: "1",
                content: "This is a secret code: 12345",
                index: 0,
                metadata: { wordCount: 6, characterCount: 30 }
            }]
        };
        const docA = await this.req('post', '/documents', docPayload, this.context.userA.token, "User A Create Document");
        this.expectSuccess(docA, "Document Created");
        if (docA.data?.data?.document?._id) this.resources.docId = docA.data.data.document._id;
        else if (docA.data?.data?._id) this.resources.docId = docA.data.data._id;

        // List Documents
        const listDocs = await this.req('get', '/documents', null, this.context.userA.token, "User A List Documents");
        this.expectSuccess(listDocs, "Documents Listed");

        // Get Document Labels
        const labels = await this.req('get', '/documents/labels', null, this.context.userA.token, "User A Get Document Labels");
        this.expectSuccess(labels, "Document Labels Retrieved");

        // Isolation
        if (this.resources.docId) {
            const steal = await this.req('get', `/documents/${this.resources.docId}`, null, this.context.userB.token, "User B Access User A Doc");
            if (steal.status >= 400) {
                this.pass("Isolation Enforced (404/403)", `GET /documents/{user_a_doc_id} with User B token → Expect 403/404 error (isolation verified)`);
            } else {
                this.fail("Isolation Enforced (404/403)", { status: steal.status, data: steal.data }, "User B should NOT be able to access User A's document");
            }

            // Get Document By ID (Owner)
            const getDoc = await this.req('get', `/documents/${this.resources.docId}`, null, this.context.userA.token, "User A Get Own Document");
            this.expectSuccess(getDoc, "Document Retrieved by Owner");

            // Update (Patch)
            const patch = await this.req('patch', `/documents/${this.resources.docId}`, { name: "Updated Doc", description: "Updated description" }, this.context.userA.token, "User A Patch Doc");
            this.expectSuccess(patch, "Document Updated");

            // SECURITY: User B cannot update User A's doc
            await this.req('patch', `/documents/${this.resources.docId}`, { name: "Hacked" }, this.context.userB.token, "User B Tries Update User A's Doc (Negative)").then(r => {
                this.expectFailure(r, "User B Cannot Update User A's Document");
            });

            // SECURITY: User B cannot delete User A's doc
            await this.req('delete', `/documents/${this.resources.docId}`, null, this.context.userB.token, "User B Tries Delete User A's Doc (Negative)").then(r => {
                this.expectFailure(r, "User B Cannot Delete User A's Document");
            });
        }
    }

    // Phase 9: Chatbots
    async phase9_Chatbots() {
        this.section("PHASE 9: Chatbots");

        // Valid Chatbot with Full Theme
        const botPayload = {
            name: "Private Bot",
            document_ids: [this.resources.docId].filter(Boolean),
            visibility: "PRIVATE",
            system_prompt: "You are a helpful assistant.",
            llm_config_id: this.resources.llmIdA || undefined,
            view_source_documents: true,
            temperature: 0.7,
            max_tokens: 500,
            theme: {
                light: FULL_THEME_COLORS,
                dark: FULL_THEME_COLORS,
                msg_bubble_radius: 12, input_radius: 12, header_logo_radius: 8,
                header_logo_width: 36, header_logo_height: 36, header_logo_border_width: 0,
                shadow_intensity: "sm", loading_animation_style: "dot", show_header_separator: false
            },
            logo: "https://via.placeholder.com/150"
        };

        const botA = await this.req('post', '/chatbots', botPayload, this.context.userA.token, "User A Create Bot");
        this.expectSuccess(botA, "Chatbot Created");
        if (botA.data?.data?.chatbot?._id) this.resources.botId = botA.data.data.chatbot._id;
        else if (botA.data?.data?._id) this.resources.botId = botA.data.data._id;

        // Invalid Theme
        const badBot = await this.req('post', '/chatbots', { ...botPayload, theme: { light: {} } }, this.context.userA.token, "Create Bot Bad Theme");
        this.expectFailure(badBot, "Bad Theme Blocked");

        // List Chatbots
        const listBots = await this.req('get', '/chatbots', null, this.context.userA.token, "User A List Chatbots");
        this.expectSuccess(listBots, "Chatbots Listed");

        // Isolation
        if (this.resources.botId) {
            const stealBot = await this.req('get', `/chatbots/${this.resources.botId}`, null, this.context.userB.token, "User B Access Private Bot");
            this.expectFailure(stealBot, "Isolation Enforced");

            // Get Chatbot By ID (Owner)
            const getBot = await this.req('get', `/chatbots/${this.resources.botId}`, null, this.context.userA.token, "User A Get Own Chatbot");
            this.expectSuccess(getBot, "Chatbot Retrieved by Owner");

            // Update Chatbot
            const updateBot = await this.req('patch', `/chatbots/${this.resources.botId}`, { name: "Updated Bot" }, this.context.userA.token, "User A Update Chatbot");
            this.expectSuccess(updateBot, "Chatbot Updated");

            // Update Visibility
            const updateVis = await this.req('patch', `/chatbots/${this.resources.botId}/visibility`, { visibility: "PUBLIC" }, this.context.userA.token, "User A Update Visibility to Public");
            this.expectSuccess(updateVis, "Visibility Updated to Public");

            // Now User B can access public bot
            const accessPublic = await this.req('get', `/chatbots/${this.resources.botId}`, null, this.context.userB.token, "User B Access Public Bot");
            this.expectSuccess(accessPublic, "User B Can Access Public Bot");

            // Change back to private
            await this.req('patch', `/chatbots/${this.resources.botId}/visibility`, { visibility: "PRIVATE" }, this.context.userA.token, "User A Update Visibility to Private");

            // Share Bot
            const share = await this.req('post', `/chatbots/${this.resources.botId}/share`, { emails: [this.context.userB.email.toLowerCase()] }, this.context.userA.token, "Share Bot with B");
            this.expectSuccess(share, "Bot Shared");

            // Access Shared
            const accessShared = await this.req('get', `/chatbots/${this.resources.botId}`, null, this.context.userB.token, "User B Access Shared Bot");
            this.expectSuccess(accessShared, "Shared Access Granted");

            // SECURITY: User B cannot update User A's bot
            await this.req('patch', `/chatbots/${this.resources.botId}`, { name: "Hacked" }, this.context.userB.token, "User B Tries Update User A's Bot (Negative)").then(r => {
                this.expectFailure(r, "User B Cannot Update User A's Chatbot");
            });

            // SECURITY: User B cannot delete User A's bot
            await this.req('delete', `/chatbots/${this.resources.botId}`, null, this.context.userB.token, "User B Tries Delete User A's Bot (Negative)").then(r => {
                this.expectFailure(r, "User B Cannot Delete User A's Chatbot");
            });

            // SECURITY: User B cannot use User A's document for their bot
            await this.req('post', '/chatbots', {
                name: "Thief Bot",
                document_ids: [this.resources.docId],
                system_prompt: "You are a helpful assistant.",
                llm_config_id: "000000000000000000000000",
                view_source_documents: false,
                temperature: 0.7,
                max_tokens: 500,
                theme: {
                    light: FULL_THEME_COLORS,
                    dark: FULL_THEME_COLORS,
                    msg_bubble_radius: 12, input_radius: 12, header_logo_radius: 8,
                    header_logo_width: 36, header_logo_height: 36, header_logo_border_width: 0,
                    shadow_intensity: "sm", loading_animation_style: "dot", show_header_separator: false
                },
                logo: "https://via.placeholder.com/150"
            }, this.context.userB.token, "User B Tries Use User A's Doc (Negative)").then(r => {
                this.expectFailure(r, "User B Cannot Use User A's Document");
            });
        }
    }

    // Phase 10: Chat Flow
    async phase10_Chat() {
        this.section("PHASE 10: Chat Flow");

        if (this.resources.botId) {
            // Start Conversation
            const start = await this.req('post', `/chat/${this.resources.botId}/start`, {}, this.context.userA.token, "Start Chat");
            this.expectSuccess(start, "Chat Started");
            const convId = start.data?.data?.chat?._id || start.data?.data?.conversationId || start.data?.data?._id;

            // Send Message
            if (convId) {
                this.resources.convId = convId;

                const msg = await this.req('post', `/chat/conversations/${convId}/message`, { message: "Hello" }, this.context.userA.token, "Send Message");
                this.expectSuccess(msg, "Message Sent");

                // Get Conversation
                const getConv = await this.req('get', `/chat/conversations/${convId}`, null, this.context.userA.token, "Get Conversation");
                this.expectSuccess(getConv, "Conversation Retrieved");

                // Update Conversation Title
                const updateTitle = await this.req('patch', `/chat/conversations/${convId}/title`, { title: "My Chat" }, this.context.userA.token, "Update Conversation Title");
                this.expectSuccess(updateTitle, "Conversation Title Updated");

                // SECURITY: User B cannot access User A's conversation
                await this.req('get', `/chat/conversations/${convId}`, null, this.context.userB.token, "User B Tries Access User A's Conversation (Negative)").then(r => {
                    this.expectFailure(r, "User B Cannot Access User A's Conversation");
                });

                // Delete Conversation
                const delConv = await this.req('delete', `/chat/conversations/${convId}`, null, this.context.userA.token, "Delete Conversation");
                this.expectSuccess(delConv, "Conversation Deleted");
            }

            // List All Conversations
            const listConvs = await this.req('get', '/chat', null, this.context.userA.token, "List All Conversations");
            this.expectSuccess(listConvs, "Conversations Listed");

            // Get Chat History (should be empty or minimal after conversation deletion)
            const history = await this.req('get', `/chat/${this.resources.botId}/history`, null, this.context.userA.token, "Get Chat History");
            // History might be empty after deletion, just check it returns 200 or 404
            if (history.status === 200 || history.status === 404) {
                this.pass("Chat History Retrieved (or empty after deletion)");
            } else {
                this.fail("Chat History Request Failed", { status: history.status });
            }

            // Delete Chat History
            const delHistory = await this.req('delete', `/chat/${this.resources.botId}/history`, null, this.context.userA.token, "Delete Chat History");
            this.expectSuccess(delHistory, "Chat History Deleted");
        }
    }

    // Phase 11: Dashboard
    async phase11_Dashboard() {
        this.section("PHASE 11: User Dashboard");

        const dashboard = await this.req('get', '/dashboard', null, this.context.userA.token, "Get Dashboard Stats");
        this.expectSuccess(dashboard, "Dashboard Stats Retrieved");
    }

    // Phase 12: Help Center
    async phase12_Help() {
        this.section("PHASE 12: Help Center Management");

        // User A Creates Help Ticket
        const createTicket = await this.req('post', '/help', { subject: "Help Me", body: "I need help with my chatbots." }, this.context.userA.token, "User A Creates Help Ticket");
        this.expectSuccess(createTicket, "User A Created Help Ticket");
        const ticketIdA = createTicket.data?.data?.help?._id || createTicket.data?.data?._id;

        // User B Creates Help Ticket
        const createTicketB = await this.req('post', '/help', { subject: "Security Question", body: "How secure is this?" }, this.context.userB.token, "User B Creates Help Ticket");
        this.expectSuccess(createTicketB, "User B Created Help Ticket");

        // User A List Own Tickets
        const listTickets = await this.req('get', '/help', null, this.context.userA.token, "User A List Tickets");
        this.expectSuccess(listTickets, "User A Tickets Listed");

        if (ticketIdA) {
            // User A Get Own Ticket
            const getTicket = await this.req('get', `/help/${ticketIdA}`, null, this.context.userA.token, "User A Get Own Ticket");
            this.expectSuccess(getTicket, "Ticket Retrieved");

            // User A Reply to Own Ticket
            const replyTicket = await this.req('post', `/help/${ticketIdA}/reply`, { content: "Nevermind, I found it." }, this.context.userA.token, "User A Reply to Ticket");
            this.expectSuccess(replyTicket, "User A Replied to Ticket");

            // SECURITY: User B cannot see User A's ticket
            await this.req('get', `/help/${ticketIdA}`, null, this.context.userB.token, "User B Tries Access User A's Ticket (Negative)").then(r => {
                this.expectFailure(r, "User B Blocked from User A Ticket");
            });

            // SECURITY: User B cannot reply to User A's ticket
            await this.req('post', `/help/${ticketIdA}/reply`, { content: "Hacked" }, this.context.userB.token, "User B Tries Reply to User A's Ticket (Negative)").then(r => {
                this.expectFailure(r, "User B Blocked from Replying to User A Ticket");
            });
        }

        // Admin List All Tickets
        const adminListTickets = await this.req('get', '/admin/help', null, this.context.admin.token, "Admin List All Help Tickets");
        this.expectSuccess(adminListTickets, "Admin Listed All Help Tickets");

        if (ticketIdA) {
            // Admin Get Ticket By ID
            const adminGetTicket = await this.req('get', `/admin/help/${ticketIdA}`, null, this.context.admin.token, "Admin Get Ticket A");
            this.expectSuccess(adminGetTicket, "Admin Retrieved Ticket A");

            // Admin Reply to Ticket
            const adminReply = await this.req('post', `/admin/help/${ticketIdA}/reply`, { content: "We are glad you fixed it!" }, this.context.admin.token, "Admin Reply to Ticket A");
            this.expectSuccess(adminReply, "Admin Replied to Ticket A");
        }

        // SECURITY: User cannot access Admin Help APIs
        await this.req('get', '/admin/help', null, this.context.userA.token, "User A Tries Admin Help List (Negative)").then(r => {
            this.expectFailure(r, "User Blocked from Admin Help API");
        });
    }

    // Phase 13: Admin Access to User APIs
    async phase13_AdminUserAccess() {
        this.section("PHASE 13: Admin Access to User APIs");

        // Admin creates document (has user permissions via role)
        const adminDoc = await this.req('post', '/documents', {
            name: "Admin Doc",
            description: "Admin document",
            chunks: [{
                id: "1",
                content: "Created by admin.",
                index: 0,
                metadata: { characterCount: 17, wordCount: 3 }
            }]
        }, this.context.admin.token, "Admin Creates Document");
        this.expectSuccess(adminDoc, "Admin Can Create Document");
        const adminDocId = adminDoc.data?.data?.document?._id || adminDoc.data?.data?._id;

        if (adminDocId) {
            // Admin creates chatbot
            const adminBot = await this.req('post', '/chatbots', {
                name: "Admin Bot",
                document_ids: [adminDocId],
                visibility: "PRIVATE",
                system_prompt: "You are a helpful assistant.",
                llm_config_id: "000000000000000000000000", // Dummy ID for testing
                view_source_documents: false,
                temperature: 0.7,
                max_tokens: 500,
                theme: {
                    light: FULL_THEME_COLORS,
                    dark: FULL_THEME_COLORS,
                    msg_bubble_radius: 12, input_radius: 12, header_logo_radius: 8,
                    header_logo_width: 36, header_logo_height: 36, header_logo_border_width: 0,
                    shadow_intensity: "sm", loading_animation_style: "dot", show_header_separator: false
                },
                logo: "https://via.placeholder.com/150"
            }, this.context.admin.token, "Admin Creates ChatBot");
            this.expectSuccess(adminBot, "Admin Can Create ChatBot");
        }

        // Admin views dashboard
        const adminDash = await this.req('get', '/dashboard', null, this.context.admin.token, "Admin Views Dashboard");
        this.expectSuccess(adminDash, "Admin Can View Dashboard");

        // Admin lists chatbots
        const adminListBots = await this.req('get', '/chatbots', null, this.context.admin.token, "Admin Lists Own Bots");
        this.expectSuccess(adminListBots, "Admin Can List ChatBots");
    }

    // Phase 14: Comprehensive Quota Testing
    async phase14_QuotaTesting() {
        this.section("PHASE 14: Comprehensive Quota Testing");

        // Create Small Test Plan (2 Bots, 2 Docs, 10 words, 2 Shares)
        const smallPlan = await this.req('post', '/admin/plans', {
            name: `SmallPlan_${Date.now()}`,
            description: "Small Limits",
            price: 1.00,
            duration: 30,
            max_chatbot_count: 2,
            max_chatbot_shares: 2,
            max_document_count: 2,
            max_word_count_per_document: 10,
            is_public_chatbot_allowed: false,
            benefits: ["Tiny"]
        }, this.context.admin.token, "Create Small Plan");
        this.expectSuccess(smallPlan, "Small Plan Created");
        const smallPlanId = smallPlan.data?.data?.plan?._id;

        if (smallPlanId && this.context.quotaUser.id) {
            // Subscribe Quota User
            await this.req('post', '/admin/subscriptions', {
                user_id: this.context.quotaUser.id,
                plan_id: smallPlanId,
                start_date: new Date(),
                end_date: new Date(Date.now() + 30*24*60*60*1000),
                status: 'active',
                payment_status: 'paid'
            }, this.context.admin.token, "Subscribe Quota User");

            // Test Document Count Limit (Max 2)
            const doc1 = await this.req('post', '/documents', {
                name: "Doc1",
                description: "Test",
                chunks: [{id:"1", content:"Word1 Word2", index:0, metadata:{wordCount:2, characterCount:11}}]
            }, this.context.quotaUser.token, "Quota User Creates Doc 1");
            this.expectSuccess(doc1, "Doc 1 Created");
            const quotaDoc1Id = doc1.data?.data?.document?._id || doc1.data?.data?._id;

            const doc2 = await this.req('post', '/documents', {
                name: "Doc2",
                description: "Test",
                chunks: [{id:"1", content:"Word1 Word2", index:0, metadata:{wordCount:2, characterCount:11}}]
            }, this.context.quotaUser.token, "Quota User Creates Doc 2");
            this.expectSuccess(doc2, "Doc 2 Created");

            await this.req('post', '/documents', {
                name: "Doc3",
                description: "Test",
                chunks: [{id:"1", content:"Word1 Word2", index:0, metadata:{wordCount:2, characterCount:11}}]
            }, this.context.quotaUser.token, "Quota User Tries Create Doc 3 (Limit 2)").then(r => {
                if (r.status >= 400) {
                    this.pass("Document Count Limit Enforced", "POST /documents with quota user (2/2 used) → Expect 400/403 quota exceeded error");
                } else {
                    this.fail("Document Count Limit Enforced", { status: r.status }, "Should not allow creating 3rd document when limit is 2");
                }
            });

            // Test Word Count Limit (Max 10 words, 12 should fail)
            if (quotaDoc1Id) {
                await this.req('delete', `/documents/${quotaDoc1Id}`, null, this.context.quotaUser.token, "Free up doc slot");
            }

            await this.req('post', '/documents', {
                name: "LargeDoc",
                description: "Too large",
                chunks: [{id:"1", content:"One two three four five six seven eight nine ten eleven twelve", index:0, metadata:{wordCount:12, characterCount:60}}]
            }, this.context.quotaUser.token, "Quota User Tries Create Large Doc (>10 words)").then(r => {
                this.expectFailure(r, "Word Count Limit Enforced");
            });

            // Test Chatbot Count Limit (Max 2)
            const validDoc = await this.req('post', '/documents', {
                name: "ValidDoc",
                description: "Valid",
                chunks: [{id:"1", content:"Small content", index:0, metadata:{wordCount:2, characterCount:13}}]
            }, this.context.quotaUser.token, "Create Valid Doc for Bots");
            const validDocId = validDoc.data?.data?.document?._id || validDoc.data?.data?._id;

            if (validDocId) {
                const bot1 = await this.req('post', '/chatbots', {
                    name: "Bot1",
                    document_ids: [validDocId],
                    visibility: "PRIVATE",
                    system_prompt: "You are a helpful assistant.",
                    llm_config_id: "000000000000000000000000", // Dummy ID for testing
                    view_source_documents: false,
                    temperature: 0.7,
                    max_tokens: 500,
                    theme: {
                        light: FULL_THEME_COLORS,
                        dark: FULL_THEME_COLORS,
                        msg_bubble_radius: 12, input_radius: 12, header_logo_radius: 8,
                        header_logo_width: 36, header_logo_height: 36, header_logo_border_width: 0,
                        shadow_intensity: "sm", loading_animation_style: "dot", show_header_separator: false
                    },
                    logo: "https://via.placeholder.com/150"
                }, this.context.quotaUser.token, "Quota User Creates Bot 1");
                this.expectSuccess(bot1, "Bot 1 Created");
                const bot1Id = bot1.data?.data?.chatbot?._id || bot1.data?.data?._id;

                const bot2 = await this.req('post', '/chatbots', {
                    name: "Bot2",
                    document_ids: [validDocId],
                    visibility: "PRIVATE",
                    system_prompt: "You are a helpful assistant.",
                    llm_config_id: "000000000000000000000000", // Dummy ID for testing
                    view_source_documents: false,
                    temperature: 0.7,
                    max_tokens: 500,
                    theme: {
                        light: FULL_THEME_COLORS,
                        dark: FULL_THEME_COLORS,
                        msg_bubble_radius: 12, input_radius: 12, header_logo_radius: 8,
                        header_logo_width: 36, header_logo_height: 36, header_logo_border_width: 0,
                        shadow_intensity: "sm", loading_animation_style: "dot", show_header_separator: false
                    },
                    logo: "https://via.placeholder.com/150"
                }, this.context.quotaUser.token, "Quota User Creates Bot 2");
                this.expectSuccess(bot2, "Bot 2 Created");

                await this.req('post', '/chatbots', {
                    name: "Bot3",
                    document_ids: [validDocId],
                    visibility: "PRIVATE",
                    system_prompt: "You are a helpful assistant.",
                    llm_config_id: "000000000000000000000000", // Dummy ID for testing
                    view_source_documents: false,
                    temperature: 0.7,
                    max_tokens: 500,
                    theme: {
                        light: FULL_THEME_COLORS,
                        dark: FULL_THEME_COLORS,
                        msg_bubble_radius: 12, input_radius: 12, header_logo_radius: 8,
                        header_logo_width: 36, header_logo_height: 36, header_logo_border_width: 0,
                        shadow_intensity: "sm", loading_animation_style: "dot", show_header_separator: false
                    },
                    logo: "https://via.placeholder.com/150"
                }, this.context.quotaUser.token, "Quota User Tries Create Bot 3 (Limit 2)").then(r => {
                    this.expectFailure(r, "Chatbot Count Limit Enforced");
                });

                // Test Share Count Limit (Max 2)
                if (bot1Id) {
                    const share1 = await this.req('post', `/chatbots/${bot1Id}/share`, {
                        emails: [this.context.userA.email.toLowerCase(), this.context.userB.email.toLowerCase()]
                    }, this.context.quotaUser.token, "Quota User Shares Bot with 2 Emails");
                    this.expectSuccess(share1, "Shared with 2 emails");

                    await this.req('post', `/chatbots/${bot1Id}/share`, {
                        emails: ["share3@test.com"]
                    }, this.context.quotaUser.token, "Quota User Tries Share with 3rd Email").then(r => {
                        this.expectFailure(r, "Share Limit Enforced (Max 2)");
                    });
                }
            }
        }
    }

    // Phase 15: Cleanup
    async phase15_Cleanup() {
        this.section("PHASE 15: Cleanup");

        // Delete ChatBots
        if (this.resources.botId) {
            const delBot = await this.req('delete', `/chatbots/${this.resources.botId}`, null, this.context.userA.token, "Delete Bot");
            this.expectSuccess(delBot, "Bot Deleted (or already gone)");
        }

        // Delete Documents
        if (this.resources.docId) {
            const delDoc = await this.req('delete', `/documents/${this.resources.docId}`, null, this.context.userA.token, "Delete Document");
            this.expectSuccess(delDoc, "Document Deleted (or already gone)");
        }

        // Delete Plans (if needed for cleanup)
        if (this.resources.planId) {
            await this.req('delete', `/admin/plans/${this.resources.planId}`, null, this.context.admin.token, "Delete Plan");
        }
    }

    async run() {
        console.log(`Starting Comprehensive API Test Suite...`);
        try {
            await this.phase1_Auth();
            await this.phase2_Public();
            await this.phase3_Roles();
            await this.phase4_Users();
            await this.phase5_Plans();
            await this.phase6_AdminOps();
            await this.phase7_LLMConfigs();
            await this.phase8_Documents();
            await this.phase9_Chatbots();
            await this.phase10_Chat();
            await this.phase11_Dashboard();
            await this.phase12_Help();
            await this.phase13_AdminUserAccess();
            await this.phase14_QuotaTesting();
            await this.phase15_Cleanup();
        } catch (e) {
            console.error("CRITICAL SETUP FAILURE:", e);
        } finally {
            this.teardown();
        }
    }

    teardown() {
        this.section("SUMMARY");
        this.log(`Total: ${this.stats.total}`);
        this.log(`Passed: ${this.stats.passed}`);
        this.log(`Failed: ${this.stats.failed}`);

        // Detailed Test Report
        if (this.testDetails.length > 0) {
            this.section("DETAILED TEST REPORT");
            this.log(`\n${this.testDetails.length} tests with technical details:\n`);

            this.testDetails.forEach((test, index) => {
                const statusIcon = test.status === 'PASS' ? '✓' : '✗';
                this.log(`${index + 1}. [${statusIcon} ${test.status}] ${test.description}`);
                this.log(`   └─ ${test.technicalDetails}\n`);
            });
        }

        this.log(`\n═══════════════════════════════════════════════════════════════`);
        this.log(`Test Suite Completed at ${new Date().toISOString()}`);
        this.log(`═══════════════════════════════════════════════════════════════\n`);

        process.exit(this.stats.failed > 0 ? 1 : 0);
    }
}

void new ApiTester().run();
