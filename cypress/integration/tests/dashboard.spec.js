/// <reference types="cypress" />

const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
const dashboard = 'dashboard';
const dashboardTitle = capitalizeFirstLetter(dashboard);

context(dashboardTitle, () => {

    beforeEach(() => {
        cy.fixture('app').then(fixtures => {
            const port = fixtures.port
            cy.visit(`http://localhost:${port}/${dashboard}`)
        })        
    })

    it('Check base rooting url', () => {
        cy.fixture('app').then(fixtures => {
            const port = fixtures.port
            cy.visit(`http://localhost:${port}/`)
            cy.location('pathname').should('include', dashboard)
        })    
    });

    it('Check dashboard routing url', () => {
        cy.location('pathname').should('include', dashboard)
    });

    it('Check dashboard title name', () => {
        cy.contains(dashboardTitle);  
    });

    it('Check dashboard components count', () => {
        cy.get('mat-card').its('length').should('be.eq', 3)
    });

    it('Check dashboard components messages', () => {
        cy.get('.tab-message > div').spread((_taskComp, _timeTaskComp, settingsComp) => {
            expect(settingsComp.innerText).to.eq('Change whatever you want');
        })
    });
  })
  
  
