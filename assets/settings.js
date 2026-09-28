/* The settings page: the URIs to register, and a check that the issuer answers. */
(function () {
  "use strict";

  var shell = window.AppShell;
  var el = shell.el;

  document.addEventListener("DOMContentLoaded", function () {
    shell.renderBrand();
    document.title = "Connection settings — " + (shell.app.name || "Demo application");

    el("uri-callback").textContent = shell.routes.callback;
    el("uri-logout").textContent = shell.routes.login;
    var launch = new URL(shell.routes.login);
    if (shell.config.issuer) launch.searchParams.set("iss", shell.config.issuer);
    el("uri-launch").textContent = launch.toString();

    el("test-issuer").addEventListener("click", function () {
      var status = el("issuer-status");
      status.className = "verify";
      status.textContent = "Checking " + shell.config.issuer + "…";
      window.CiamOidc.discover(shell.config.issuer)
        .then(function (doc) {
          var ok = doc.issuer === shell.config.issuer;
          status.className = ok ? "verify ok" : "verify err";
          status.textContent = ok
            ? "✓ Discovery answered and its issuer matches the configuration."
            : "Discovery answered, but it names its issuer as " + doc.issuer + ".";
        })
        .catch(function (error) {
          status.className = "verify err";
          status.textContent = error.message;
        });
    });
  });
})();
