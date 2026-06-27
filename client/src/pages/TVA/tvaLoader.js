export const tvaLoader = async ({ params }) => {
  const { companyId } = params;
  if (!companyId) return { declarations: [], status: null };
  try {
    const [statusRes, declsRes] = await Promise.all([
      import("../../utils/customFetch.js").then((m) =>
        m.default.get(`/tva/companies/${companyId}/status`)
      ),
      import("../../utils/customFetch.js").then((m) =>
        m.default.get(`/tva/companies/${companyId}/declarations`)
      ),
    ]);
    return {
      status: statusRes.data,
      declarations: declsRes.data.declarations || [],
    };
  } catch (error) {
    console.error("TVA loader error:", error);
    return { declarations: [], status: null, error: error.message };
  }
};
