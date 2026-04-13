@bdd @smoke
Feature: User Login
  As a customer of SauceDemo
  I want to log in with my credentials
  So that I can access the product inventory

  Background:
    Given I am on the login page

  Scenario: Successful login with valid credentials
    When I login with username "standard_user" and password "secret_sauce"
    Then I should be redirected to the inventory page
    And I should see the page title "Products"

  Scenario: Login fails with locked out user
    When I login with username "locked_out_user" and password "secret_sauce"
    Then I should see the error message "Epic sadface: Sorry, this user has been locked out."

  Scenario: Login fails with invalid credentials
    When I login with username "nonexistent_user" and password "wrong_password"
    Then I should see the error message "Epic sadface: Username and password do not match any user in this service"

  Scenario Outline: Login fails with missing credentials
    When I login with username "<username>" and password "<password>"
    Then I should see the error message "<error>"

    Examples:
      | username      | password     | error                                                                     |
      |               |              | Epic sadface: Username is required                                        |
      | standard_user |              | Epic sadface: Password is required                                        |
      |               | secret_sauce | Epic sadface: Username is required                                        |
