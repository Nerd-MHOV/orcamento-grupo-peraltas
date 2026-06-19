describe("kommoConfig", () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...ORIGINAL_ENV };
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  it("composes baseUrl from CRM_BASE_URL with /api/v4 suffix", () => {
    process.env.CRM_BASE_URL = "https://admperaltasturismo.kommo.com";
    process.env.CRM_TOKEN = "fake-jwt-token";

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { kommoConfig } = require("../kommoConfig");

    expect(kommoConfig.baseUrl).toBe(
      "https://admperaltasturismo.kommo.com/api/v4"
    );
  });

  it("reads token from CRM_TOKEN and exposes the drive url", () => {
    process.env.CRM_BASE_URL = "https://admperaltasturismo.kommo.com";
    process.env.CRM_TOKEN = "fake-jwt-token";

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { kommoConfig } = require("../kommoConfig");

    expect(kommoConfig.token).toBe("fake-jwt-token");
    expect(kommoConfig.driveUrl).toBe("https://drive.kommo.com");
  });

  it("maps the confirmed numeric field_ids", () => {
    process.env.CRM_BASE_URL = "https://admperaltasturismo.kommo.com";

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { kommoConfig } = require("../kommoConfig");

    expect(kommoConfig.fields.check_in).toBe(804864);
    expect(kommoConfig.fields.check_out).toBe(804868);
    expect(kommoConfig.fields.adt).toBe(786330);
    expect(kommoConfig.fields.chd_amount).toBe(786328);
    expect(kommoConfig.fields.chd_ages).toBe(786322);
    expect(kommoConfig.fields.pet_amount).toBe(786324);
    expect(kommoConfig.fields.pet_sizes).toBe(786326);
    expect(kommoConfig.fields.tariffs_used).toBe(805299);
  });

  it("maps the Porte PET multiselect enum ids", () => {
    process.env.CRM_BASE_URL = "https://admperaltasturismo.kommo.com";

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { kommoConfig } = require("../kommoConfig");

    expect(kommoConfig.fields.pet_sizes_enum.Pequeno).toBe(648186);
    expect(kommoConfig.fields.pet_sizes_enum["Médio"]).toBe(648188);
    expect(kommoConfig.fields.pet_sizes_enum.Grande).toBe(648190);
  });
});
