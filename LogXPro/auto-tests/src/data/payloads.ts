/** Payload bảo mật vô hại, chỉ dùng trên môi trường test. */
export const xssPayload = '<script>window.__logxpro_xss_test__=1</script>';
export const sqlInjection = "' OR 1=1 --";
export const sqlDrop = "'; DROP TABLE contracts; --";
export const sqlOrString = "' OR '1'='1";
export const pathTraversalName = '../../etc/passwd.pdf';
export const windowsTraversalName = '..\\..\\x.pdf';
export const excelFormula = '=HYPERLINK("http://example.invalid","bam vao")';
export const malformedJson = '{"name": ';
