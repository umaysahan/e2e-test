@bdd @critical
Feature: End-to-End Checkout
  As a customer of SauceDemo
  I want to add products to my cart and complete checkout
  So that I can purchase items successfully

  Background:
    Given I am logged in as a standard user

  Scenario: Complete purchase of a single item
    When I add "Sauce Labs Backpack" to the cart
    And I navigate to the cart
    Then the cart should contain 1 item
    When I proceed to checkout
    And I fill in checkout info with first name "John", last name "Doe", and postal code "12345"
    And I continue to the order overview
    And I finish the order
    Then I should see the confirmation message "Thank you for your order!"

  Scenario: Complete purchase of multiple items
    When I add "Sauce Labs Backpack" to the cart
    And I add "Sauce Labs Bike Light" to the cart
    And I navigate to the cart
    Then the cart should contain 2 items
    When I proceed to checkout
    And I fill in checkout info with first name "Jane", last name "Smith", and postal code "90210"
    And I continue to the order overview
    And I finish the order
    Then I should see the confirmation message "Thank you for your order!"

  Scenario: Checkout fails with missing information
    When I add "Sauce Labs Backpack" to the cart
    And I navigate to the cart
    And I proceed to checkout
    And I continue to the order overview without filling info
    Then I should see the checkout error "Error: First Name is required"
