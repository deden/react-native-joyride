// @flow
import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { View } from 'react-native';

import JoyrideModal from './JoyrideModal';

import { getFirstStep, getLastStep, getStepNumber, getPrevStep, getNextStep } from './utilities';
import { OFFSET_WIDTH } from './style';

import type { Step, JoyrideContext } from './types';

type State = {
  steps: { [string]: Step },
  currentStep: ?Step,
  visible: boolean,
};

const joyride = ({
  nextButton,
  prevButton,
  stopButton,
  finishButton,
} = {}) =>
  (WrappedComponent) => {
    class Joyride extends Component<any, State> {
      state = {
        steps: {},
        currentStep: null,
        visible: false,
      };

      getChildContext(): { _joyride: JoyrideContext } {
        return {
          _joyride: {
            registerStep: this.registerStep,
            unregisterStep: this.unregisterStep,
            getCurrentStep: () => this.state.currentStep,
          },
        };
      }

      getStepNumber = (step: ?Step = this.state.currentStep): number =>
        getStepNumber(this.state.steps, step);

      getFirstStep = (): ?Step => getFirstStep(this.state.steps);

      getLastStep = (): ?Step => getLastStep(this.state.steps);

      getPrevStep = (step: ?Step = this.state.currentStep): ?Step =>
        getPrevStep(this.state.steps, step);

      getNextStep = (step: ?Step = this.state.currentStep): ?Step =>
        getNextStep(this.state.steps, step);

      setCurrentStep = async (step: Step): void => {
        await this.setState({ currentStep: step });

        const size = await this.state.currentStep.target.measure();

        this.modal.animateMove({
          width: size.width + OFFSET_WIDTH,
          height: size.height + OFFSET_WIDTH,
          left: size.x - (OFFSET_WIDTH / 2),
          top: size.y - (OFFSET_WIDTH / 2),
        });
      }

      setVisibility = (visible: boolean): void => {
        this.setState({ visible });
      }

      isFirstStep = (): boolean => this.state.currentStep === this.getFirstStep();

      isLastStep = (): boolean => this.state.currentStep === this.getLastStep();

      registerStep = (step: Step): void => {
        this.setState(({ steps }) => ({
          steps: {
            ...steps,
            [step.name]: step,
          },
        }));
      }

      unregisterStep = (stepName: string): void => {
        this.setState(({ steps }) => ({
          steps: Object.entries(steps)
            .filter(([key]) => key !== stepName)
            .reduce((obj, [key, val]) => Object.assign(obj, { [key]: val }), {}),
        }));
      }

      next = (): void => {
        this.setCurrentStep(this.getNextStep());
      }

      prev = (): void => {
        this.setCurrentStep(this.getPrevStep());
      }

      start = (fromStep?: string): void => {
        const { steps } = this.state;

        const currentStep = fromStep
          ? steps.find(step => step.name === fromStep)
          : this.getFirstStep();

        this.setCurrentStep(currentStep);
        this.setVisibility(true);
      }

      stop = (): void => {
        this.setVisibility(false);
      }

      render() {
        return (
          <View style={{ flex: 1 }}>
            <WrappedComponent
              {...this.props}
              start={this.start}
              currentStep={this.state.currentStep}
              visible={this.state.visible}
            />
            <JoyrideModal
              next={this.next}
              prev={this.prev}
              stop={this.stop}
              visible={this.state.visible}
              isFirstStep={this.isFirstStep()}
              isLastStep={this.isLastStep()}
              currentStepNumber={this.getStepNumber()}
              currentStep={this.state.currentStep}
              nextButton={nextButton}
              prevButton={prevButton}
              stopButton={stopButton}
              finishButton={finishButton}
              ref={(modal) => { this.modal = modal; }}
            />
          </View>
        );
      }
    }

    Joyride.childContextTypes = {
      _joyride: PropTypes.object.isRequired,
    };

    return Joyride;
  };

export default joyride;
