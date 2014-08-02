'use strict';


module.exports = function IndexModel() {
    return {
        name: 'index',
        services: [
          {
            domain: "91ferns.com",
            description: "91ferns blog and website",
            host: "Azure"
          },
          {
            domain: "patsys.com",
            description: "Patsy's restaurant blog, store and website",
            host: "Azure"
          }
        ],
        applications: [
          {
            site: "Patsy's",
            apps: [
            {
              name: "Store Manager"
            },
            {
              name: "Analytics"
            }
            ]
          }
        ]
    };
};
