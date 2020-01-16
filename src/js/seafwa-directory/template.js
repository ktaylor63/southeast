module.exports = e => {
  const phone = e.MobilePhone ? e.MobilePhone : e.OfficePhone;

  return `
  <li class="card card-text seafwa-employee">
    <div class="seafwa-content">
      <h2>${e.Name}<br><span class="seafwa-title">${e.Title}</span></h2>
      <p class="seafwa-region">${e.Department}</p>

      <ul class="seafwa-contact">
        <li class="seafwa-icon-group">
          <img src="../images/svg/location.svg" alt="Map icon" class="seafwa-icon"/>
          <p class="seafwa-address">${e.StreetAddress}, ${e.City}, ${e.State} ${e.PostalCode}</p>
        </li>
        <li class="seafwa-icon-group">
          <img class="seafwa-icon" src="../images/svg/phone.svg" alt="Phone icon"/>
          <p class="seafwa-phone">${phone}</p>
        </li>
        <li class="seafwa-icon-group">
          <img class="seafwa-icon" src="../images/svg/email.svg" alt="Email icon"/>
          <p class="seafwa-email"><a href="mailto:${e.Mail}">${e.Mail}</a></p>
        </li>
      </ul>
    </div>
  </li>`;
};